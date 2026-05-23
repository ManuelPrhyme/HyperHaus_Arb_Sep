class BrowserWebSocket extends globalThis.WebSocket {
  constructor(url, protocolsOrOptions) {
    if (
      !protocolsOrOptions ||
      (typeof protocolsOrOptions === "object" &&
        !Array.isArray(protocolsOrOptions))
    ) {
      super(url);
    } else {
      super(url, protocolsOrOptions);
    }

    this._listeners = {};

    this.addEventListener("open", (e) => this._emit("open", e));
    this.addEventListener("close", (e) =>
      this._emit("close", e.code, e.reason),
    );
    this.addEventListener("error", (e) => this._emit("error", e));
    this.addEventListener("message", (e) => this._emit("message", e.data));
  }

  _emit(event, ...args) {
    const fns = this._listeners[event] || [];
    fns.forEach((fn) => fn(...args));
    this._listeners[event] = fns.filter((fn) => !fn._once);
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return this;
  }

  once(event, fn) {
    fn._once = true;
    return this.on(event, fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter((f) => f !== fn);
    return this;
  }

  emit(event, ...args) {
    this._emit(event, ...args);
    return this;
  }

  removeAllListeners(event) {
    if (event) delete this._listeners[event];
    else this._listeners = {};
    return this;
  }
}

// ← Removed static constant assignments; they are inherited read-only from native WebSocket

export default BrowserWebSocket;
export { BrowserWebSocket as WebSocket };
