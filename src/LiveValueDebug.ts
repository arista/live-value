import {DebugEvent} from "./DebugEvent"

export type DebugEventListener = (e:DebugEvent)=>void

export class _LiveValueDebug {
  idCounter = 1
  listeners: Array<DebugEventListener> = []
  logToConsole = false

  nextId() {
    return this.idCounter++
  }

  get isLogging() {
    return this.logToConsole || this.hasListeners
  }

  logDebug(e: DebugEvent) {
    if (this.hasListeners) {
      const listeners = [...this.listeners]
      for(const listener of listeners) {
        listener(e)
      }
    }
    if (this.logToConsole) {
      const str = this.debugEventToString(e)
      console.log(str)
    }
  }

  resetIdCounter() {
    this.idCounter = 1
  }

  get hasListeners() {
    return this.listeners.length !== 0
  }

  addListener(listener:DebugEventListener) {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener)
    }
  }

  removeListener(listener:DebugEventListener) {
    const ix = this.listeners.indexOf(listener)
    if (ix >= 0) {
      this.listeners.splice(ix, 1)
    }
  }

  debugEventToString(e:DebugEvent):string {
    switch(e.type) {
    case "CreatingLiveValue":
      return `Creating LiveValue "${e.liveValueName}" with initial value <${e.value}>`
    case "CreatingUninitializedLiveValue":
      return `Creating LiveValue "${e.liveValueName}" with no initial value`
    case "CreatingComputedLiveValue":
      return `Creating computed LiveValue "${e.liveValueName}"`
    case "AssignedNewValue":
      return `Changed LiveValue "${e.liveValueName}" value from <${e.oldValue}> to <${e.newValue}>`
    case "ComputingValue":
      return `Computing LiveValue "${e.liveValueName}"`
    case "ComputedValue":
      return `Computed LiveValue "${e.liveValueName}" as <${e.newValue}>`
    case "InvalidatedComputedValue":
      return `Invalidated computed LiveValue "${e.liveValueName}" with old value <${e.oldValue}>`
    case "AddedListener":
      return `Added listener "${e.listenerName}" to LiveValue "${e.liveValueName}"`
    case "RemovedListener":
      return `Removed listener "${e.listenerName}" from LiveValue "${e.liveValueName}"`
    case "NotifyingListeners":
      return `Notifying ${e.listenerCount} listener${e.listenerCount == 1 ? "" : "s"} of LiveValue "${e.liveValueName}"`
    case "NotifyingListener":
      return `Notifying listener ${e.listenerName} of LiveValue "${e.liveValueName}"`
    case "AddingDependency":
      return `LiveValue "${e.dependentLiveValueName}" depends on LiveValue "${e.dependencyLiveValueName}"`
    case "RemovingDependency":
      return `LiveValue "${e.dependentLiveValueName}" no longer depends on LiveValue "${e.dependencyLiveValueName}"`
    case "StartingOnChange":
      return `Starting onChange "${e.onChangeName} on LiveValue "${e.liveValueName}"`
    case "ResolvingOnChange":
      return `Resolving onChange "${e.onChangeName} on LiveValue "${e.liveValueName}" with value ${e.value}`
    case "TimingOutOnChange":
      return `Timed Out onChange "${e.onChangeName} on LiveValue "${e.liveValueName}" after ${e.timeoutMsec}ms`
    case "StartingOnMatch":
      return `Starting onMatch "${e.onMatchName} on LiveValue "${e.liveValueName}"`
    case "ResolvingOnMatch":
      return `Resolving onMatch "${e.onMatchName} on LiveValue "${e.liveValueName}" with value ${e.value}`
    case "TimingOutOnMatch":
      return `Timed Out onMatch "${e.onMatchName} on LiveValue "${e.liveValueName}" after ${e.timeoutMsec}ms`
    case "ConnectingUseLiveValue":
      return `Connecting useLiveValue "${e.useLiveValueName}" to LiveValue "${e.liveValueName}"`
    case "DisconnectingUseLiveValue":
      return `Disconnecting useLiveValue "${e.useLiveValueName}" from LiveValue "${e.liveValueName}"`
    case "RerenderingUseLiveValue":
      return `Rerendering useLiveValue "${e.useLiveValueName}"`
    }
  }
}

export const LiveValueDebug = new _LiveValueDebug()
