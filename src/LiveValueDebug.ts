import * as DE from "./DebugEvent"

export class _LiveValueDebug {
  idCounter = 1
  isLogging = false

  nextId() {
    return this.idCounter++
  }

  logDebug(e: DE.DebugEvent) {
    // FIXME - implement this
  }

  resetIdCounter() {
    this.idCounter = 1
  }
}

export const LiveValueDebug = new _LiveValueDebug()
