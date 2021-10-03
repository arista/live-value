import {Value} from "./Value"
import {LiveValue} from "./LiveValue"
import {LiveValueDebug} from "./LiveValueDebug"

export class AssignedValue<T> extends Value<T> {
  constructor(liveValue: LiveValue<T>, public _value: T) {
    super(liveValue)

    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "AssignedInitialValue",
        liveValueName: this.liveValue.name,
        liveValue: this.liveValue,
        value: _value,
      })
    }
  }

  getValue() {
    return this._value
  }

  setValue(value: T) {
    if (value !== this._value) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "AssignedNewValue",
          liveValueName: this.liveValue.name,
          liveValue: this.liveValue,
          oldValue: this._value,
          newValue: value,
        })
      }
      this._value = value
      this.liveValue.notifyListeners()
    }
  }

  get canSetValue() {
    return true
  }

  disconnectDependencies() {}
}
