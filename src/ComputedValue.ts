import {Value} from "./Value"
import {LiveValue} from "./LiveValue"
import {DependencyTracker} from "./DependencyTracker"

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
      this.computedValue = DependencyTracker.withDependent(this, this.f)
      this.valid = true
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
      this.computedValue = null
      this.disconnectDependencies()

      // Notify listeners
      this.liveValue.notifyListeners()
    }
  }

  disconnectDependencies() {
    // Remove listener from all dependencies
    for (const dependency of this.dependencies) {
      dependency.removeListener(this.dependencyListener)
    }

    // Clear out dependencies
    this.dependencies = []
  }

  addDependency(liveValue: LiveValue<any>) {
    if (this.dependencies.indexOf(liveValue) < 0) {
      this.dependencies.push(liveValue)
      liveValue.addListener(this.dependencyListener)
    }
  }

  get canSetValue() {
    return false
  }
}
