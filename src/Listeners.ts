import {LiveValueDebug} from "./LiveValueDebug"
import {LiveValue} from "./LiveValue"

export class Listeners {
  listeners: Array<ListenerEntry> | null = null

  constructor(public liveValue: LiveValue<any>) {}

  add(listener: Listener, name: string) {
    if (this.listeners == null) {
      this.listeners = [{listener, name}]
    } else {
      const ix = this.indexOf(listener)
      if (ix < 0) {
        this.listeners.push({listener, name})
      }
    }
  }

  remove(listener: Listener): string | null {
    if (this.listeners != null) {
      const ix = this.indexOf(listener)
      if (ix >= 0) {
        const le = this.listeners[ix]
        this.listeners.splice(ix, 1)
        return le.name
      }
    }
    return null
  }

  indexOf(listener: Listener) {
    if (this.listeners == null) {
      return -1
    }
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].listener === listener) {
        return i
      }
    }
    return -1
  }

  notify() {
    if (this.listeners != null && this.listeners.length > 0) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "NotifyingListeners",
          liveValueName: this.liveValue.name,
          liveValue: this.liveValue,
          listenerCount: this.listenerCount,
        })
      }

      const listeners = [...this.listeners]
      for (const listener of listeners) {
        // DebugEvent
        if (LiveValueDebug.isLogging) {
          LiveValueDebug.logDebug({
            type: "NotifyingListener",
            liveValueName: this.liveValue.name,
            liveValue: this.liveValue,
            listenerName: listener.name,
          })
        }

        // FIXME - debugEvent - notifying listener
        listener.listener()
      }
    }
  }

  get listenerCount(): number {
    return this.listeners == null ? 0 : this.listeners.length
  }
}

export type Listener = () => void

export interface ListenerEntry {
  listener: Listener
  name: string
}
