export class Listeners {
  listeners: Array<ListenerEntry> | null = null

  constructor(public name:string) {}

  add(listener: Listener, name:string|null = null) {
    if (this.listeners == null) {
      this.listeners = [{listener, name}]
    } else {
      const ix = this.indexOf(listener)
      if (ix < 0) {
        this.listeners.push({listener, name})
      }
    }
  }

  remove(listener: Listener) {
    if (this.listeners != null) {
      const ix = this.indexOf(listener)
      if (ix >= 0) {
        this.listeners.splice(ix, 1)
      }
    }
  }

  indexOf(listener: Listener) {
    if (this.listeners == null) {
      return -1
    }
    for(let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].listener === listener) {
        return i
      }
    }
    return -1
  }

  notify() {
    // FIXME - debugEvent - notifying listeners
    if (this.listeners != null && this.listeners.length > 0) {
      const listeners = [...this.listeners]
      for (const listener of listeners) {
        // FIXME - debugEvent - notifying listener
        listener.listener()
      }
    }
  }

  get listenerCount():number {
    return (this.listeners == null) ? 0 : this.listeners.length
  }
}

export type Listener = () => void

export interface ListenerEntry {
  listener: Listener
  name: string|null
}
