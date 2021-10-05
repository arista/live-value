import {Listeners} from "./Listeners"
import {Listener} from "./Listeners"
import {Value} from "./Value"
import {AssignedValue} from "./AssignedValue"
import {ComputedValue} from "./ComputedValue"
import {DependencyTracker} from "./DependencyTracker"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"
import {DebugEvent} from "./DebugEvent"

export type {DebugEvent} from "./DebugEvent"

export class LiveValue<T> {
  listeners: Listeners
  _value: Value<T> | null = null

  name: string

  constructor(
    value: Initializer<T> | _NoValue = NoValue,
    name: NameInit = null
  ) {
    this.name = nameInitToName(name, "LiveValue")
    this.listeners = new Listeners(this)

    if (value instanceof _NoValue) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "CreatingUninitializedLiveValue",
          liveValueName: this.name,
          liveValue: this,
        })
      }
      this._value = null
    } else if (typeof value === "function") {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "CreatingComputedLiveValue",
          liveValueName: this.name,
          liveValue: this,
        })
      }
      this._value = new ComputedValue(this, value as any)
    } else {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "CreatingLiveValue",
          liveValueName: this.name,
          liveValue: this,
          value,
        })
      }
      this._value = new AssignedValue(this, value)
    }
  }

  addListener(listener: Listener, name: NameInit = null) {
    const _name = nameInitToName(name, "Listener")
    this.listeners.add(listener, _name)

    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "AddedListener",
        liveValueName: this.name,
        liveValue: this,
        listenerName: _name,
      })
    }
  }

  removeListener(listener: Listener) {
    const listenerName = this.listeners.remove(listener)
    if (listenerName != null) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "RemovedListener",
          liveValueName: this.name,
          liveValue: this,
          listenerName,
        })
      }
    }
  }

  notifyListeners() {
    this.listeners.notify()
  }

  get listenerCount(): number {
    return this.listeners.listenerCount
  }

  get value(): T {
    if (this._value == null) {
      throw new Error(
        `LiveValue has not yet been assigned a value or a function`
      )
    }
    const ret = this._value.getValue()
    DependencyTracker.addDependency(this)
    return ret
  }

  set value(value: T) {
    // FIXME - debugEvent - set value
    if (this._value == null) {
      this._value = new AssignedValue(this, value)
      this.notifyListeners()
    } else if (this._value.canSetValue) {
      this._value.setValue(value)
    } else {
      this.disconnectDependencies()
      this._value = new AssignedValue(this, value)
      this.notifyListeners()
    }
  }

  // Returns if a value has been assigned
  get hasValue(): boolean {
    return this._value != null
  }

  // This will forcefully "disconnect" the value from its
  // dependencies, removing any listeners that cause this value to be
  // notified when those dependencies change.  This is intended to be
  // called if a computed LiveValue is dereferenced by the
  // application, since those dependency listeners will cause the
  // LiveValue to remain in memory.
  //
  // Note that calling this is not strictly necessary - even if a
  // LiveValue remains in memory, it will eventually disconnect itself
  // whenever any of its dependencies change.
  disconnectDependencies() {
    if (this._value != null) {
      this._value.disconnectDependencies()
    }
  }

  // Waits for the value to change, then resolves the Promise with the
  // new value.  If timeoutMsec is non-null and elapses, then the
  // Promise rejects with an Error.
  onChange(
    timeoutMsec: number | null = null,
    name: NameInit = null
  ): Promise<T> {
    const _name = nameInitToName(name, "onChange")
    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "StartingOnChange",
        liveValueName: this.name,
        liveValue: this,
        onChangeName: _name,
      })
    }

    const ret = new Promise<T>((resolve, reject) => {
      let listener: (() => void) | null = null
      let t: ReturnType<typeof setTimeout> | null = null

      // Function to remove the listener and clear the timeout
      const cleanup = () => {
        if (listener != null) {
          this.removeListener(listener)
        }
        if (t != null) {
          clearTimeout(t)
        }
      }

      // Remember the original value to make sure it has changed
      const hasOriginalValue = this.hasValue
      const originalValue = hasOriginalValue ? this.value : null
      listener = () => {
        const value = this.value
        if (!hasOriginalValue || value !== originalValue) {
          cleanup()

          // DebugEvent
          if (LiveValueDebug.isLogging) {
            LiveValueDebug.logDebug({
              type: "ResolvingOnChange",
              liveValueName: this.name,
              liveValue: this,
              onChangeName: _name,
              value,
            })
          }

          resolve(value)
        }
      }
      this.addListener(listener, _name)

      // Set up the timeout
      if (timeoutMsec != null) {
        t = setTimeout(() => {
          // DebugEvent
          if (LiveValueDebug.isLogging) {
            LiveValueDebug.logDebug({
              type: "TimingOutOnChange",
              liveValueName: this.name,
              liveValue: this,
              onChangeName: _name,
              timeoutMsec,
            })
          }
          reject(new Error("LiveValue timeout"))
          cleanup()
        }, timeoutMsec)
      }
    })
    return ret
  }

  // Returns a Promise that resolves to the LiveValue's value when
  // that value causes the given test to return true.  If timeoutMsec
  // is non-null and elapses, then the Promise rejects with an Error.
  onMatch(
    test: (val: T) => boolean,
    timeoutMsec: number | null = null,
    name: NameInit = null
  ): Promise<T> {
    const _name = nameInitToName(name, "onMatch")
    const ret = new Promise<T>((resolve, reject) => {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "StartingOnMatch",
          liveValueName: this.name,
          liveValue: this,
          onMatchName: _name,
        })
      }

      // See if it matches immediately
      if (this.hasValue && test(this.value)) {
        // DebugEvent
        if (LiveValueDebug.isLogging) {
          LiveValueDebug.logDebug({
            type: "ResolvingOnMatch",
            liveValueName: this.name,
            liveValue: this,
            onMatchName: _name,
            value: this.value,
          })
        }
        resolve(this.value)
      } else {
        let listener: (() => void) | null = null
        let t: ReturnType<typeof setTimeout> | null = null

        // Function to remove the listener and clear the timeout
        const cleanup = () => {
          if (listener != null) {
            this.removeListener(listener)
          }
          if (t != null) {
            clearTimeout(t)
          }
        }

        // Listen and test the value
        listener = () => {
          const value = this.value
          if (test(value)) {
            cleanup()
            // DebugEvent
            if (LiveValueDebug.isLogging) {
              LiveValueDebug.logDebug({
                type: "ResolvingOnMatch",
                liveValueName: this.name,
                liveValue: this,
                onMatchName: _name,
                value: this.value,
              })
            }
            resolve(this.value)
          }
        }
        this.addListener(listener, _name)

        // Set up the timeout
        if (timeoutMsec != null) {
          t = setTimeout(() => {
            // DebugEvent
            if (LiveValueDebug.isLogging) {
              LiveValueDebug.logDebug({
                type: "TimingOutOnMatch",
                liveValueName: this.name,
                liveValue: this,
                onMatchName: _name,
                timeoutMsec,
              })
            }
            reject(new Error("LiveValue timeout"))
            cleanup()
          }, timeoutMsec)
        }
      }
    })
    return ret
  }

  static addDebugListener(listener: (e: DebugEvent) => void) {
    LiveValueDebug.addListener(listener)
  }

  static removeDebugListener(listener: (e: DebugEvent) => void) {
    LiveValueDebug.removeListener(listener)
  }

  static debugEventToString(e: DebugEvent): string {
    return LiveValueDebug.debugEventToString(e)
  }

  static enableDebugToConsole() {
    LiveValueDebug.logToConsole = true
  }

  static disableDebugToConsole() {
    LiveValueDebug.logToConsole = false
  }

  static DebugToConsole(props: {enable: boolean}) {
    const {enable} = props
    LiveValueDebug.logToConsole = enable
    return null
  }
}

export type NotFunction<T> = T extends Function ? never : T
export type ValueFunc<T> = () => T
export type Initializer<T> = NotFunction<T> | ValueFunc<T>

class _NoValue {}
const NoValue = new _NoValue()
