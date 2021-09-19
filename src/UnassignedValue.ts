import {Value} from "./Value"
import {LiveValue} from "./LiveValue"

export class UnassignedValue<T> extends Value<T> {
  constructor(liveValue:LiveValue<T>) {
    super(liveValue)
  }

  getValue():T {
    throw new Error(`Not implemented`)
  }

  setValue(value:T) {
    throw new Error(`Not implemented`)
  }
}
