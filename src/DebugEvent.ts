import {LiveValue} from "./LiveValue"

export type DebugEvent =
  | CreatingLiveValue
  | AssignedInitialValue
  | AssignedNewValue
  | AddedListener
  | RemovedListener
  | NotifyingListeners
  | NotifyingListener
  | AddedDependency
  | StartingOnChange
  | ResolvingOnChange
  | TimingOutOnChange
  | StartingOnMatch
  | ResolvingOnMatch
  | TimingOutOnMatch

export interface CreatingLiveValue {
  type: "CreatingLiveValue"
  liveValueName: string
  liveValue: LiveValue<any>
}

export interface AssignedInitialValue {
  type: "AssignedInitialValue"
  liveValueName: string
  liveValue: LiveValue<any>
  value: any
}

export interface AssignedNewValue {
  type: "AssignedNewValue"
  liveValueName: string
  liveValue: LiveValue<any>
  oldValue: any
  newValue: any
}

export interface AddedListener {
  type: "AddedListener"
  liveValueName: string
  liveValue: LiveValue<any>
  listenerName: string
}

export interface RemovedListener {
  type: "RemovedListener"
  liveValueName: string
  liveValue: LiveValue<any>
  listenerName: string
}

export interface NotifyingListeners {
  type: "NotifyingListeners"
  liveValueName: string
  liveValue: LiveValue<any>
  listenerCount: number
}

export interface NotifyingListener {
  type: "NotifyingListener"
  liveValueName: string
  liveValue: LiveValue<any>
  listenerName: string
}

export interface NotifyingListeners {
  type: "NotifyingListeners"
  liveValueName: string
  liveValue: LiveValue<any>
  listenerCount: number
}

export interface AddedDependency {
  type: "AddedDependency"
  dependentLiveValue: LiveValue<any>
  dependentLiveValueName: string
  dependencyLiveValue: LiveValue<any>
  dependencyLiveValueName: string
}

export interface StartingOnChange {
  type: "StartingOnChange"
  liveValue: LiveValue<any>
  liveValueName: string
  onChangeName: string
}

export interface ResolvingOnChange {
  type: "ResolvingOnChange"
  liveValue: LiveValue<any>
  liveValueName: string
  onChangeName: string
  value: any
}

export interface TimingOutOnChange {
  type: "TimingOutOnChange"
  liveValue: LiveValue<any>
  liveValueName: string
  onChangeName: string
}

export interface StartingOnMatch {
  type: "StartingOnMatch"
  liveValue: LiveValue<any>
  liveValueName: string
  onMatchName: string
}

export interface ResolvingOnMatch {
  type: "ResolvingOnMatch"
  liveValue: LiveValue<any>
  liveValueName: string
  onMatchName: string
  value: any
}

export interface TimingOutOnMatch {
  type: "TimingOutOnMatch"
  liveValue: LiveValue<any>
  liveValueName: string
  onMatchName: string
}
