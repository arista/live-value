import {Listeners} from "./Listeners"
import {Listener} from "./Listeners"
import {Value} from "./Value"
import {AssignedValue} from "./AssignedValue"
import {ComputedValue} from "./ComputedValue"
import {DependencyTracker} from "./DependencyTracker"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

export class LiveValue<T> {
  listeners:Listeners
  _value: Value<T> | null = null

  id:number
  name: string

  constructor(value: Initializer<T> | _NoValue = NoValue, name: NameInit = null) {
    this.id = LiveValueDebug.nextId
    this.name = nameInitToName(name, this.id, "LiveValue")
    this.listeners = new Listeners(this.name)
    
    // FIXME - debugEvent - create LiveValue
    
    if (value instanceof _NoValue) {
      this._value = null
    } else if (typeof value === "function") {
      this._value = new ComputedValue(this, value as any)
    } else {
      this._value = new AssignedValue(this, value)
    }
  }

  addListener(listener: Listener, name:string|null = null) {
    // FIXME - debugEvent - add listener
    this.listeners.add(listener, name)
  }

  removeListener(listener: Listener) {
    // FIXME - debugEvent - remove listener
    this.listeners.remove(listener)
  }

  notifyListeners() {
    // FIXME - debugEvent - notifying listeners
    this.listeners.notify()
  }
  
  get listenerCount():number {
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
  get hasValue():boolean {
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
  onChange(timeoutMsec:number|null = null):Promise<T> {
    const ret = new Promise<T>((resolve, reject)=>{
      let listener:(()=>void)|null = null
      let t:ReturnType<typeof setTimeout>|null = null

      // Function to remove the listener and clear the timeout
      const cleanup = ()=>{
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
      listener = ()=>{
        const value = this.value
        if (!hasOriginalValue || value !== originalValue) {
          cleanup()
          resolve(value)
        }
      }
      // FIXME - debugEvent - add name
      this.addListener(listener)

      // Set up the timeout
      if (timeoutMsec != null) {
        t = setTimeout(()=>{
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
  onMatch(test:(val:T)=>boolean, timeoutMsec:number|null = null):Promise<T> {
    const ret = new Promise<T>((resolve, reject)=>{
      // See if it matches immediately
      if (this.hasValue && test(this.value)) {
        resolve(this.value)
      }
      else {
        let listener:(()=>void)|null = null
        let t:ReturnType<typeof setTimeout>|null = null

        // Function to remove the listener and clear the timeout
        const cleanup = ()=>{
          if (listener != null) {
            this.removeListener(listener)
          }
          if (t != null) {
            clearTimeout(t)
          }
        }

        // Listen and test the value
        listener = ()=>{
          const value = this.value
          if (test(value)) {
            cleanup()
            resolve(this.value)
          }
        }
        // FIXME - debugEvent - add name
        this.addListener(listener)

        // Set up the timeout
        if (timeoutMsec != null) {
          t = setTimeout(()=>{
            reject(new Error("LiveValue timeout"))
            cleanup()
          }, timeoutMsec)
        }
      }
    })
    return ret
  }
}

export type NotFunction<T> = T extends Function ? never : T
export type ValueFunc<T> = () => T
export type Initializer<T> = NotFunction<T> | ValueFunc<T>

class _NoValue {}
const NoValue = new _NoValue()
