import {Listeners} from "./Listeners"
import {Listener} from "./Listeners"
import {Value} from "./Value"
import {AssignedValue} from "./AssignedValue"
import {ComputedValue} from "./ComputedValue"
import {UnassignedValue} from "./UnassignedValue"
import {DependencyTracker} from "./DependencyTracker"

export class LiveValue<T> {
  listeners = new Listeners()
  _value: Value<T>

  constructor(value: Initializer<T>) {
    if (typeof(value) === "function") {
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
    const ret = this._value.getValue()
    DependencyTracker.addDependency(this)
    return ret
  }

  set value(value: T) {
    this._value.setValue(value)
  }
}

export type NotFunction<T> = T extends Function ? never : T;
export type ValueFunc<T> = ()=>T
export type Initializer<T> = NotFunction<T> | ValueFunc<T>
