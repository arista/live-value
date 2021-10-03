import {ComputedValue} from "./ComputedValue"
import {LiveValue} from "./LiveValue"

export type DependencyCallback = () => void

class _DependencyTracker {
  stack: Array<ComputedValue<any>> = []

  withDependent<T>(dependent: ComputedValue<any>, f: () => T): T {
    // Check for circular dependency
    if (this.stack.indexOf(dependent) >= 0) {
      throw new Error(
        `Computed LiveValue directly or indirectly references itself`
      )
    }

    this.stack.push(dependent)
    try {
      return f()
    } finally {
      this.stack.pop()
    }
  }

  addDependency(dependency: LiveValue<any>) {
    const d = this.currentDependent
    if (d != null) {
      // FIXME - debugEvent - add name
      d.addDependency(dependency)
    }
  }

  get currentDependent(): ComputedValue<any> | null {
    return this.stack.length == 0 ? null : this.stack[this.stack.length - 1]
  }
}

export const DependencyTracker = new _DependencyTracker()
