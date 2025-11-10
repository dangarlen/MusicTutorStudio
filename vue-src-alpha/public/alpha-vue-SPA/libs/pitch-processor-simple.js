class PitchProcessorSimple extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = new Float32Array(1024);
    this._idx = 0;
    this._lastEnergy = 0;
    this._rmsGate = 0.001;
    this._onsetThreshold = 0.15;
    this.port.onmessage = (e) => {
      const d = e.data || {};
      if (d.rmsGate !== undefined) this._rmsGate = d.rmsGate;
      if (d.onsetThreshold !== undefined) this._onsetThreshold = d.onsetThreshold;
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];
    let read = 0;
    while (read < channel.length) {
      const toCopy = Math.min(channel.length - read, this._buf.length - this._idx);
      this._buf.set(channel.subarray(read, read + toCopy), this._idx);
      this._idx += toCopy;
      read += toCopy;
      if (this._idx >= this._buf.length) {
        // analyze
        const freq = this._autoCorrelate(this._buf, sampleRate);
        // simple energy/onset
        let sum = 0;
        for (let i = 0; i < this._buf.length; i++) sum += this._buf[i]*this._buf[i];
        const rms = Math.sqrt(sum / this._buf.length);
        let onset = false;
        if (rms > this._rmsGate && rms > this._lastEnergy * (1 + this._onsetThreshold)) onset = true;
        this._lastEnergy = rms;
        this.port.postMessage({ type: 'analysis', freq: freq, onset: onset, onsetTime: currentTime });
        this._idx = 0;
      }
    }
    return true;
  }

  _autoCorrelate(buf, sr) {
    // basic autocorrelation
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null;
    let r1 = 0, r2 = SIZE - 1;
    for (let i = 0; i < SIZE/2; i++) { if (Math.abs(buf[i]) < 0.2) { r1 = i; break; } }
    for (let i = 1; i < SIZE/2; i++) { if (Math.abs(buf[SIZE - i]) < 0.2) { r2 = SIZE - i; break; } }
    const sliced = buf.slice(r1, r2);
    const newSize = sliced.length;
    if (newSize < 16) return null;
    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < newSize - i; j++) c[i] += sliced[j]*sliced[j+i];
    }
    let d = 0; while (c[d] > c[d+1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
    if (maxpos <= 0) return null;
    const T0 = maxpos;
    const freq = sr / T0;
    if (freq > 20000 || freq < 50) return null;
    return freq;
  }
}

registerProcessor('pitch-processor', PitchProcessorSimple);
