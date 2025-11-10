class AubioForwarderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // batching configuration
    this._batchSize = 1024; // send every 1024 samples
    this._accum = new Float32Array(this._batchSize);
    this._idx = 0;
  }

  process (inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];
    let read = 0;
    const len = channel.length;
    while (read < len) {
      const remain = this._batchSize - this._idx;
      const toCopy = Math.min(remain, len - read);
      // copy chunk
      this._accum.set(channel.subarray(read, read + toCopy), this._idx);
      this._idx += toCopy;
      read += toCopy;
      if (this._idx >= this._batchSize) {
        // emit a copy (so we can reset the internal buffer without transferring it)
        const out = new Float32Array(this._accum);
        try {
          this.port.postMessage({ type: 'audio', audio: out.buffer }, [out.buffer]);
        } catch (e) {
          // ignore transfer failures
        }
        this._idx = 0;
      }
    }
    return true;
  }
}

registerProcessor('aubio-forwarder', AubioForwarderProcessor);