import {Value} from "./Value"
import {LiveValue} from "./LiveValue"

export class AssignedValue<T> extends Value<T> {
  constructor(liveValue:LiveValue<T>, public _value:T) {
    super(liveValue)
  }

  getValue() {
    return this._value
  }

  setValue(value:T) {
    if (value !== this._value) {
      this._value = value
      this.liveValue.notifyListeners()
    }
  }
}
