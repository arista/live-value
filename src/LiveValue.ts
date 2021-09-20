import {Listeners} from "./Listeners"
import {Listener} from "./Listeners"
import {Value} from "./Value"
import {AssignedValue} from "./AssignedValue"
import {ComputedValue} from "./ComputedValue"
import {DependencyTracker} from "./DependencyTracker"

export class LiveValue<T> {
  listeners = new Listeners()
  _value: Value<T>|null = null

  constructor(value: Initializer<T>|_NoValue = NoValue) {
    if (value instanceof _NoValue) {
      this._value = null
    }
    else if (typeof(value) === "function") {
      this._value = new ComputedValue(this, value as any)
    }
    else {
      this._value = new AssignedValue(this, value)
    }
  }

  addListener(listener:Listener) {
    this.listeners.add(listener)
  }

  removeListener(listener:Listener) {
    this.listeners.remove(listener)
  }

  notifyListeners() {
    this.listeners.notify()
  }

  get value():T {
    if (this._value == null) {
      throw new Error(`LiveValue has not yet been assigned a value or a function`)
    }
    const ret = this._value.getValue()
    DependencyTracker.addDependency(this)
    return ret
  }

  set value(value: T) {
    if (this._value == null) {
      this._value = new AssignedValue(this, value)
      this.notifyListeners()
    }
    else if (this._value.canSetValue) {
      this._value.setValue(value)
    }
    else {
      this.disconnectDependencies()
      this._value = new AssignedValue(this, value)
      this.notifyListeners()
    }
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
}

export type NotFunction<T> = T extends Function ? never : T;
export type ValueFunc<T> = ()=>T
export type Initializer<T> = NotFunction<T> | ValueFunc<T>

class _NoValue {}
const NoValue = new _NoValue()
