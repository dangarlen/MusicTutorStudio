// Worker to host aubio pitch detection (falls back to autocorrelation if aubio not present)
self.aubioModule = null;
self.aubioReady = false;

function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;
  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE/2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
  for (let i = 1; i < SIZE/2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
  const slice = buf.slice(r1, r2);
  const newSize = slice.length;
  if (newSize < 16) return null;
  const c = new Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) c[i] = c[i] + slice[j]*slice[j+i];
  }
  let d = 0; while (c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < newSize; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
  const T0 = maxpos; if (!T0 || T0 === 0) return null;
  const freq = sampleRate / T0; if (freq > 20000 || freq < 50) return null; return freq;
}

// Try to load aubio glue (synchronous importScripts is available in workers)
try {
  importScripts('libs/aubio.js');
  // attempt to find common exports
  const factory = self.createAubioModule || self.createAubio || self.Aubio || self.aubio || self.aubioModule || null;
  if (factory) {
    if (typeof factory === 'function') {
      // try to instantiate with locateFile pointing to worker-relative path
      factory({ locateFile: (p) => 'libs/aubio.wasm' }).then((m) => {
        self.aubioModule = m; self.aubioReady = true; self.postMessage({ type: 'aubio-status', ok: true });
      }).catch((e) => { self.postMessage({ type: 'aubio-status', ok: false, error: String(e) }); });
    } else {
      self.aubioModule = factory; self.aubioReady = true; self.postMessage({ type: 'aubio-status', ok: true });
    }
  } else {
    self.postMessage({ type: 'aubio-status', ok: false, error: 'no aubio export' });
  }
} catch (e) {
  self.postMessage({ type: 'aubio-status', ok: false, error: String(e) });
}

let pitchDetector = null;
let sampleRate = 44100;

onmessage = function(e) {
  const d = e.data || {};
  if (d.type === 'init') {
    sampleRate = d.sampleRate || 44100;
    // create aubio pitch detector if module ready
    if (self.aubioReady && self.aubioModule) {
      try {
        const M = self.aubioModule;
        if (M.Pitch) {
          pitchDetector = new M.Pitch();
        } else if (M.Aubio && M.Aubio.Pitch) {
          pitchDetector = new M.Aubio.Pitch();
        }
      } catch (ee) { /* ignore */ }
    }
    return;
  }
  if (d.type === 'audio' && d.audio) {
    // d.audio is a Float32Array (transferred)
    const floatBuf = new Float32Array(d.audio);
    let freq = null;
    if (pitchDetector && typeof pitchDetector.do === 'function') {
      try {
        // some aubio builds expect different APIs; attempt common patterns
        const out = pitchDetector.do(floatBuf);
        freq = (typeof out === 'number') ? out : (out && out[0]) || null;
      } catch (e) { freq = null; }
    }
    if (!freq) {
      freq = autoCorrelate(floatBuf, sampleRate);
    }
    postMessage({ type: 'analysis', freq: freq });
  }
};