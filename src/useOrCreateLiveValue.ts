import {useState} from "react"
import {LiveValue} from "./LiveValue"

export type useOrCreateLiveValueProps<T> = LiveValue<T> | (() => T)

export interface State<T> {
  props: useOrCreateLiveValueProps<T>
  liveValue: LiveValue<T>
}

function toLiveValue<T>(liveValue: useOrCreateLiveValueProps<T>): LiveValue<T> {
  return typeof liveValue === "function" ? new LiveValue(liveValue) : liveValue
}

// Returns either the passed-in LiveValue, or a LiveValue created
// around the passed-in function.  The same created LiveValue will
// always be returned if the same function or LiveValue is passed in.
//
// If a new LiveValue or function is passed in, then a double-rerender
// may occur, since the update function of setState is used to
export function useOrCreateLiveValue<T>(
  props: useOrCreateLiveValueProps<T>
): LiveValue<T> {
  // Put props into an Array, since props could be a function which
  // will confuse useState
  const [prevProps, setPrevProps] = useState([props])
  const [liveValue, setLiveValue] = useState(() => toLiveValue(props))

  if (prevProps[0] !== props) {
    liveValue.disconnectDependencies()
    const newLiveValue = toLiveValue(props)
    setLiveValue(newLiveValue)
    setPrevProps([props])
    return newLiveValue
  } else {
    return liveValue
  }
}
