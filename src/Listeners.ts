export class Listeners {
  listeners: Array<Listener> | null = null

  constructor() {}

  add(listener: Listener) {
    if (this.listeners == null) {
      this.listeners = [listener]
    } else {
      const ix = this.listeners.indexOf(listener)
      if (ix < 0) {
        this.listeners.push(listener)
      }
    }
  }

  remove(listener: Listener) {
    if (this.listeners != null) {
      const ix = this.listeners.indexOf(listener)
      if (ix >= 0) {
        this.listeners.splice(ix, 1)
      }
    }
  }

  notify() {
    if (this.listeners != null && this.listeners.length > 0) {
      const listeners = [...this.listeners]
      for (const listener of listeners) {
        listener()
      }
    }
  }

  get listenerCount():number {
    return (this.listeners == null) ? 0 : this.listeners.length
  }
}

export type Listener = () => void
