// AudioWorklet processor for basic pitch detection and onset detection
// Receives mono input and sends lightweight analysis messages to the main thread

class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.energyBuffer = [];
    this.lastOnsetFrame = -Infinity;
    this.onsets = [];
    this.frameCounter = 0; // total frames processed
    this.onsetThreshold = 0.15;
    this.rmsGate = 0.001;

    // ring buffer for a larger analysis window (improves frequency resolution)
    this.ringSize = 2048;
    this.ringBuffer = new Float32Array(this.ringSize);
    this.ringFill = 0; // how many valid samples in ring
    this.ringPos = 0; // next write position

    this.aubioModule = null;
    this.aubioReady = false;

    // start aubio init but do not block constructor
    try { this._initAubio(); } catch (e) { /* ignore */ }

    // allow param tuning from main thread
    this.port.onmessage = (e) => {
      const d = e.data || {};
      if (typeof d.onsetThreshold === 'number') this.onsetThreshold = d.onsetThreshold;
      if (typeof d.rmsGate === 'number') this.rmsGate = d.rmsGate;
      if (d && d.type === 'reload-aubio') {
        try { this._initAubio(); } catch (ex) { /* ignore */ }
      }
    };
  }

  _initAubio() {
    // Non-blocking initializer that tries to load aubio glue + wasm (if present).
    return (async () => {
      const base = '';
      const jsUrl = base + 'libs/aubio.js';
      const wasmUrl = base + 'libs/aubio.wasm';

      try {
        // Try synchronous importScripts (works in worklet scope)
        try {
          importScripts(jsUrl);
        } catch (ie) {
          // if importScripts fails, propagate error to be posted below
          throw new Error('importScripts failed for ' + jsUrl + ': ' + ie);
        }

        // aubio builds vary; check common globals/factories
        const factory = globalThis.createAubioModule || globalThis.createAubio || globalThis.Aubio || globalThis.aubio || globalThis.aubioModule || null;
        if (!factory) throw new Error('No aubio export found on global scope after importScripts');

        let module = null;
        if (typeof factory === 'function') {
          // factory often expects an options object with locateFile
          module = await factory({ locateFile: (p) => wasmUrl });
        } else {
          module = factory;
        }

        if (module && (module.Pitch || module.pitch || module.Aubio || module.aubio)) {
          this.aubioModule = module;
          this.aubioReady = true;
          this.port.postMessage({ type: 'aubio-status', ok: true });
        } else {
          this.aubioModule = module;
          this.aubioReady = false;
          this.port.postMessage({ type: 'aubio-status', ok: false, error: 'module API not recognized' });
        }
      } catch (e) {
        try { this.port.postMessage({ type: 'aubio-status', ok: false, error: String(e) }); } catch (e2) {}
        this.aubioModule = null;
        this.aubioReady = false;
        return;
      }
    })();
  }

  autoCorrelate(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null;

    // trim edges
    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE/2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
    for (let i = 1; i < SIZE/2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
    const slice = buf.slice(r1, r2);
    const newSize = slice.length;
    if (newSize < 16) return null;
    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < newSize - i; j++) {
        c[i] = c[i] + slice[j] * slice[j + i];
      }
    }
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;
    if (!T0 || T0 === 0) return null;
    const freq = sampleRate / T0;
    if (freq > 20000 || freq < 50) return null;
    return freq;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const chan = input[0];
    if (!chan || chan.length === 0) return true;

    // compute energy/rms
    let sum = 0;
    for (let i = 0; i < chan.length; i++) sum += chan[i] * chan[i];
    const energy = sum / chan.length;
    const rms = Math.sqrt(energy);

    // write samples into the ring buffer for larger-window analysis
    for (let i = 0; i < chan.length; i++) {
      this.ringBuffer[this.ringPos] = chan[i];
      this.ringPos = (this.ringPos + 1) % this.ringSize;
      if (this.ringFill < this.ringSize) this.ringFill++;
    }

    // add to rolling buffer
    this.energyBuffer.push(energy);
    if (this.energyBuffer.length > 8) this.energyBuffer.shift();

    // onset detection
    const avg = this.energyBuffer.reduce((a,b)=>a+b,0) / this.energyBuffer.length;
    const last = this.energyBuffer[this.energyBuffer.length - 1];
    const nowFrame = this.frameCounter + chan.length;
    let onset = false;
    if (rms >= this.rmsGate && last > avg * (1 + this.onsetThreshold)) {
      const minFramesBetween = Math.round(0.05 * sampleRate);
      if (nowFrame - this.lastOnsetFrame > minFramesBetween) {
        onset = true;
        this.lastOnsetFrame = nowFrame;
        const onsetTime = nowFrame / sampleRate;
        this.onsets.push(onsetTime);
        if (this.onsets.length > 64) this.onsets.shift();
      }
    }

    // pitch detection using autocorrelation on a larger window (from ring buffer)
    let freq = null;
    try {
      if (this.ringFill >= this.ringSize) {
        const window = new Float32Array(this.ringSize);
        let start = this.ringPos;
        for (let i = 0; i < this.ringSize; i++) {
          window[i] = this.ringBuffer[(start + i) % this.ringSize];
        }
        freq = this.autoCorrelate(window, sampleRate);
      } else {
        freq = this.autoCorrelate(chan, sampleRate);
      }
    } catch (e) {
      freq = null;
    }

    const msg = { type: 'analysis', freq: freq, energy: energy, rms: rms, onset: onset };
    if (onset) msg.onsetTime = this.lastOnsetFrame / sampleRate;

    if (onset || (this.frameCounter % (128 * 4) === 0)) {
      this.port.postMessage(msg);
    }

    this.frameCounter += chan.length;
    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
// AudioWorklet processor for basic pitch detection and onset detection
// This processor receives mono input and sends lightweight analysis
// messages to the main thread via port.postMessage({ type: 'analysis', ... }).

class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.energyBuffer = [];
    this.lastOnsetFrame = -Infinity;
    this.onsets = [];
    this.frameCounter = 0; // total frames processed
    this.onsetThreshold = 0.15;
    this.rmsGate = 0.001;
    // ring buffer for a larger analysis window (improves frequency resolution)
    this.ringSize = 2048;
    this.ringBuffer = new Float32Array(this.ringSize);
    this.ringFill = 0; // how many valid samples in ring
    this.ringPos = 0; // next write position
    this.aubioModule = null;
    this.aubioReady = false;
    // attempt to initialize aubio in the worklet (non-blocking)
    this._initAubio().catch((e) => {
      // notify main thread that aubio init failed
      try { this.port.postMessage({ type: 'aubio-status', ok: false, error: String(e) }); } catch (e2) {}
    });

    // allow param tuning from main thread
    this.port.onmessage = (e) => {
      const d = e.data || {};
      if (typeof d.onsetThreshold === 'number') this.onsetThreshold = d.onsetThreshold;
      if (typeof d.rmsGate === 'number') this.rmsGate = d.rmsGate;
      // handle aubio reload request
      if (d && d.type === 'reload-aubio') {
        try { this._initAubio(); } catch (e) {}
      }
    };
  
    // attempt to initialize aubio in the worklet (non-blocking)
    _initAubio() {
      return (async () => {
        const base = '';
        const jsUrl = base + 'libs/aubio.js';
        const wasmUrl = base + 'libs/aubio.wasm';

        try {
          const resp = await fetch(jsUrl);
          if (!resp.ok) throw new Error('aubio.js not found');
          const code = await resp.text();

          let factory = null;
          try {
            const fn = new Function('globalThis', code + '\nreturn globalThis.createAubioModule || globalThis.createAubio || globalThis.Aubio || globalThis.aubioModule || null;');
            factory = fn(globalThis);
          } catch (e) {
            try { eval(code); } catch (e2) {}
            factory = globalThis.createAubioModule || globalThis.createAubio || globalThis.Aubio || globalThis.aubioModule || null;
          }

          if (!factory) throw new Error('No aubio factory found after evaluating aubio.js');

          let module = null;
          if (typeof factory === 'function') {
            module = await factory({ locateFile: (p) => wasmUrl });
          } else {
            module = factory;
          }

          if (module && (module.Pitch || module.pitch || module.Aubio)) {
            this.aubioModule = module;
            this.aubioReady = true;
            this.port.postMessage({ type: 'aubio-status', ok: true });
          } else {
            this.aubioModule = module;
            this.aubioReady = false;
            this.port.postMessage({ type: 'aubio-status', ok: false, error: 'module API not recognized' });
          }
        } catch (e) {
          try { this.port.postMessage({ type: 'aubio-status', ok: false, error: String(e) }); } catch (e2) {}
          this.aubioModule = null;
          this.aubioReady = false;
          return;
        }
      })();
    }
  
  _initAubio() {
    return (async () => {
      // Attempt multiple strategies to load an aubio Emscripten modularized build.
      // Expectation: the build either exports a global factory function `createAubioModule`
      // or sets `globalThis.Aubio` / `globalThis.aubioModule` after evaluation. The
      // aubio JS glue must be placed at `libs/aubio.js` and the wasm at `libs/aubio.wasm`.
      const base = '';
      const jsUrl = base + 'libs/aubio.js';
      const wasmUrl = base + 'libs/aubio.wasm';

      try {
        // Try to import the aubio JS glue directly into the worklet global scope
        // using importScripts (synchronous, available in worklet scope).
        try {
          importScripts(jsUrl);
        } catch (ie) {
          throw new Error('importScripts failed for ' + jsUrl + ': ' + ie);
        }

        // The aubio build may export different globals or a factory; check all common names
        let factory = globalThis.createAubioModule || globalThis.createAubio || globalThis.Aubio || globalThis.aubio || globalThis.aubioModule || null;
        if (!factory) throw new Error('No aubio export found on global scope after importScripts');

        // If factory is a function that returns a Module promise, call it and provide locateFile
        let module = null;
        if (typeof factory === 'function') {
          module = await factory({ locateFile: (p) => wasmUrl });
        } else {
          module = factory;
        }

        // If module has an exported Pitch constructor, keep it.
        if (module && (module.Pitch || module.pitch || module.Aubio)) {
          this.aubioModule = module;
          this.aubioReady = true;
          this.port.postMessage({ type: 'aubio-status', ok: true });
        } else {
          // aubio module loaded, but API shape not recognized; still expose module for debugging
          this.aubioModule = module;
          this.aubioReady = false;
          this.port.postMessage({ type: 'aubio-status', ok: false, error: 'module API not recognized' });
        }
      } catch (e) {
        // fail quietly and leave aubio disabled; main thread fallback will be used
        try { this.port.postMessage({ type: 'aubio-status', ok: false, error: String(e) }); } catch (e2) {}
        this.aubioModule = null;
        this.aubioReady = false;
        return;
      }
    })();
  }

  autoCorrelate(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null;

    // trim edges
    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE/2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
    for (let i = 1; i < SIZE/2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
    buf = buf.slice(r1, r2);
    const newSize = buf.length;
    if (newSize < 16) return null;
    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < newSize - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;
    if (!T0 || T0 === 0) return null;
    const freq = sampleRate / T0;
    if (freq > 20000 || freq < 50) return null;
    return freq;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const chan = input[0];
    if (!chan || chan.length === 0) return true;

    // compute energy/rms
    let sum = 0;
    for (let i = 0; i < chan.length; i++) sum += chan[i] * chan[i];
    const energy = sum / chan.length;
    const rms = Math.sqrt(energy);

    // write samples into the ring buffer for larger-window analysis
    for (let i = 0; i < chan.length; i++) {
      this.ringBuffer[this.ringPos] = chan[i];
      this.ringPos = (this.ringPos + 1) % this.ringSize;
      if (this.ringFill < this.ringSize) this.ringFill++;
    }

    // add to rolling buffer
    this.energyBuffer.push(energy);
    if (this.energyBuffer.length > 8) this.energyBuffer.shift();

    // onset detection
    const avg = this.energyBuffer.reduce((a,b)=>a+b,0) / this.energyBuffer.length;
    const last = this.energyBuffer[this.energyBuffer.length - 1];
    const nowFrame = this.frameCounter + chan.length;
    let onset = false;
    if (rms >= this.rmsGate && last > avg * (1 + this.onsetThreshold)) {
      // simple refractory: at least 0.05s between onsets
      const minFramesBetween = Math.round(0.05 * sampleRate);
      if (nowFrame - this.lastOnsetFrame > minFramesBetween) {
        onset = true;
        this.lastOnsetFrame = nowFrame;
        const onsetTime = nowFrame / sampleRate;
        this.onsets.push(onsetTime);
        if (this.onsets.length > 64) this.onsets.shift();
      }
    }

    // pitch detection using autocorrelation on a larger window (from ring buffer)
    let freq = null;
    try {
      if (this.ringFill >= this.ringSize) {
        // build an ordered window where index 0 is the oldest sample
        const window = new Float32Array(this.ringSize);
        let start = this.ringPos; // oldest sample
        for (let i = 0; i < this.ringSize; i++) {
          window[i] = this.ringBuffer[(start + i) % this.ringSize];
        }
        freq = this.autoCorrelate(window, sampleRate);
      } else {
        // not enough samples yet: fall back to block autocorr
        freq = this.autoCorrelate(chan, sampleRate);
      }
    } catch (e) {
      freq = null;
    }

    // prepare a lightweight message payload
    const msg = { type: 'analysis', freq: freq, energy: energy, rms: rms, onset: onset };
    if (onset) msg.onsetTime = this.lastOnsetFrame / sampleRate;

    // throttle posting a bit: post when onset or every ~4 blocks (~512 samples)
    if (onset || (this.frameCounter % (128 * 4) === 0)) {
      this.port.postMessage(msg);
    }

    this.frameCounter += chan.length;
    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
