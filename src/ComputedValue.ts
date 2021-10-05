import {Value} from "./Value"
import {LiveValue} from "./LiveValue"
import {DependencyTracker} from "./DependencyTracker"
import {LiveValueDebug} from "./LiveValueDebug"

export class ComputedValue<T> extends Value<T> {
  valid = false
  computedValue: T | null = null
  dependencies: Array<LiveValue<any>> = []
  dependencyListener = () => this.onDependencyNotify()

  constructor(liveValue: LiveValue<T>, public f: () => T) {
    super(liveValue)
  }

  getValue(): T {
    if (!this.valid) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "ComputingValue",
          liveValueName: this.liveValue.name,
          liveValue: this.liveValue,
        })
      }

      this.computedValue = DependencyTracker.withDependent(this, this.f)
      this.valid = true

      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "ComputedValue",
          liveValueName: this.liveValue.name,
          liveValue: this.liveValue,
          newValue: this.computedValue,
        })
      }
    }
    // Can't rule out being null, since that might be part of type T
    return this.computedValue as any
  }

  setValue(value: T) {
    throw new Error(`Not implemented`)
  }

  onDependencyNotify() {
    if (this.valid) {
      this.valid = false
      const oldValue = this.computedValue
      this.computedValue = null
      this.disconnectDependencies()

      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "InvalidatedComputedValue",
          liveValueName: this.liveValue.name,
          liveValue: this.liveValue,
          oldValue: oldValue,
        })
      }

      // Notify listeners
      this.liveValue.notifyListeners()
    }
  }

  disconnectDependencies() {
    // Remove listener from all dependencies
    for (const dependency of this.dependencies) {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "RemovingDependency",
          dependentLiveValue: this.liveValue,
          dependentLiveValueName: this.liveValue.name,
          dependencyLiveValue: dependency,
          dependencyLiveValueName: dependency.name,
        })
      }
      dependency.removeListener(this.dependencyListener)
    }

    // Clear out dependencies
    this.dependencies = []
  }

  addDependency(liveValue: LiveValue<any>) {
    if (this.dependencies.indexOf(liveValue) < 0) {
      this.dependencies.push(liveValue)
      liveValue.addListener(this.dependencyListener, this.liveValue.name)
    }
  }

  get canSetValue() {
    return false
  }
}
