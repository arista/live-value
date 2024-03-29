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
  counter: LiveValue<number> // (for those using TypeScript)
}) {
  const {counter} = props
  const currentCount = useLiveValue(counter)
  return <div>Current count: {currentCount}</div>;
}
```

When updating the `value` property, the usual React rules apply for registering the update: the actual value of the property must change, and if the value is an Object or Array, a different Object or Array identity must be assigned.

### Additional Notification API's

`LiveValue` provides a simple API that allows applications to be notified when a value may have changed, either because the `value` was set directly, or because a dependency's value changed.  This effectively offers applications the same ability given to the `useLiveValue` hook:

```
addListener(listener: ()=>void, name: string|null = null)
removeListener(listener: ()=>void)
```
The optional `name` passed to addListener is used for debugging, described below.

`LiveValue` can also generate Promises that resolve the next time the `LiveValue`'s value changes, or matches a given test function.  These Promises can optionally be set to reject if a specified timeout elapses before the required condition is met.

```
onChange(timeoutMsec:number|null = null):Promise<T>
onMatch(test: (val:T)=>boolean, timeoutMsec:number|null = null):Promise<T>
```

Sample usage:

```
const newValue = await liveValue.onChange()
const matchingValue = await liveValue.onMatch(newVal=>newVal != null)
```

### Debugging

`live-value` provides insight into its inner workings by emitting events at key points of its operation: when a `LiveValue` is created, when a value is changed, when a computed value is assigned to "listen" to another value, when a `useLiveValue` hook is set to re-render, etc.  The full list of events is found at [DebugEvent](https://github.com/arista/live-value/blob/main/src/DebugEvent.ts).

An application can monitor the events by using listeners:

```
LiveValue.addDebugListener(listener:(e:DebugEvent)=>void):void
LiveValue.removeDebugListener(listener:(e:DebugEvent)=>void):void
LiveValue.debugEventToString(e:DebugEvent):string
```
The last method will convert a `DebugEvent` to a human-readable string.  For convenience, an application can also call:

```
LiveValue.enableDebugToConsole()
LiveValue.disableDebugToConsole()
```
This will automatically convert all `DebugEvents` to human-readable strings and log them through `console.log`.  A React app can do the same thing with a component:

```
<LiveValue.DebugToConsole enable={true|false} />
```

The debugging events and logs include names for the various objects and operations: LiveValue instances, useLiveValue hooks, listeners, onChange/onMatch, etc.  By default, these names are generated automatically using in incrementing counter, but can be overridden:

```
new LiveValue(10, "currentAge")
useLiveValue(lv, "displayCurrentAge")
lv.addListener(l, "myListener")
lv.onChange(5000, "waitingForResult")
lv.onMatch(5000, "waitingForGoodResult")
```

A name can be specified as a string, or as a function that takes the current id counter value and returns the name:

```
new LiveValue(10, id=>`currentAge#${id}`)
```
