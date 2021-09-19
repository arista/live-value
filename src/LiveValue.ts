import {Listeners} from "./Listeners"
import {Listener} from "./Listeners"
import {Value} from "./Value"
import {AssignedValue} from "./AssignedValue"
import {ComputedValue} from "./ComputedValue"
import {UnassignedValue} from "./UnassignedValue"

export class LiveValue<T> {
  listeners = new Listeners()

  constructor(value: Initializer<T>) {
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
}

type NotFunction<T> = T extends Function ? never : T;
type ValueFunc<T> = ()=>T
type Initializer<T> = NotFunction<T> | ValueFunc<T>
