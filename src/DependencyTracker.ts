import {ComputedValue} from "./ComputedValue"
import {LiveValue} from "./LiveValue"

export type DependencyCallback = ()=>void

class _DependencyTracker {
  stack:Array<ComputedValue<any>> = []

  withDependent<T>(dependent:ComputedValue<any>, f:()=>T):T {
    this.stack.push(dependent)
    try {
      // FIXME - check for circular
      return f()
    }
    finally {
      this.stack.pop()
    }
  }

  addDependency(dependency:LiveValue<any>) {
    const d = this.currentDependent
    if (d != null) {
      d.addDependency(dependency)
    }
  }

  get currentDependent():ComputedValue<any>|null {
    return (this.stack.length == 0) ? null : this.stack[this.stack.length - 1]
  }
}

export const DependencyTracker = new _DependencyTracker()
