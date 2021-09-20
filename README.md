# live-value

`live-value` is a simple mechanism for connecting React components to changing data.  The data is contained in `LiveValue` objects, which each expose a single `value` property that an application may change as needed.  For example:

```
import {LiveValue} from "live-value";

const counter = new LiveValue(0);
setTimeout(()=>counter.value++, 1000);
```


A React component may then pass the `LiveValue` object to a `useLiveValue` hook.  The current `value` of the `LiveValue` will be provided to the React component, and if the application later changes that `value` property, the React component will be re-rendered.
