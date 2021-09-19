import {LiveValue} from "./LiveValue"

export abstract class Value<T> {
  constructor(public liveValue:LiveValue<T>) {
  }
}
