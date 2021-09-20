# live-value

`live-value` is a simple mechanism for connecting React components to changing data.  The data is contained in `LiveValue` objects, which each expose a single `value` property that an application may change as needed.  For example, this `LiveValue` contains a counter `value` that increments every second:

```
import {LiveValue} from "live-value";

const counter = new LiveValue(0);
setInterval(()=>counter.value++, 1000);
```

A React component may then pass the `LiveValue` object to a `useLiveValue` hook.  The current `value` of the `LiveValue` will be provided to the React component, and if the application later changes that `value` property, the React component will be re-rendered.  For example, this component will display the value of the counter, re-rendering every time the counter's `value` property changes:

```
import {LiveValue, useLiveValue} from "live-value";

function ShowCount(props: {
  counter: LiveValue<number> // If you're using TypeScript
}) {
  const {counter} = props
  const currentCount = useLiveValue(counter)
  return <div>Current count: {currentCount}</div>;
}
```

When updating the `value` property, the usual React rules apply for registering the update: the actual value of the property must change, and if the value is an Object or Array, a different Object or Array identity must be assigned.

A `LiveValue` may be constructed with a function, which may in turn reference the `value` property of other `LiveValue`s.  In this case, the `LiveValue` will be updated if any of those "dependencies" changes value, and any `useLiveValue` hooks referencing that `LiveValue` will force their components to re-render.

For example:

```
const counter1 = new LiveValue(0);
setInterval(()=>counter1.value++, 1000);

const counter2 = new LiveValue(0);
setInterval(()=>counter2.value++, 700);

const counterSum = new LiveValue(()=>counter1.value + counter2.value)
```

Here there are two `LiveValue`s whose values are incrementing at varying rates, and a third `LiveValue` computes the sum of the two.  If the `counterSum` is passed to the `ShowCount` component above, that component will re-render whenever either of those counters changes value.
