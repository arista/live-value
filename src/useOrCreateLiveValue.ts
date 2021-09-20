//import {useState} from "react"
import {useMemo} from "react"
import {LiveValue} from "./LiveValue"

export type useOrCreateLiveValueProps<T> =
  LiveValue<T> |
  (()=>T)

export interface State<T> {
  props: useOrCreateLiveValueProps<T>,
  liveValue: LiveValue<T>
}

function toLiveValue<T>(liveValue:useOrCreateLiveValueProps<T>):LiveValue<T> {
  return (typeof(liveValue) === "function") ? new LiveValue(liveValue) : liveValue
}

// Returns either the passed-in LiveValue, or a LiveValue created
// around the passed-in function.  The same created LiveValue will
// always be returned if the same function is passed in.
export function useOrCreateLiveValue<T>(props:useOrCreateLiveValueProps<T>):LiveValue<T> {
  /*
  const state = useState((prevState:State<T>)=>{
    console.log(`prevState`, prevState)
    if (prevState == null) {
      return {
        props,
        liveValue: toLiveValue(props)
      }
    }
    else if(prevState.props === props) {
      return prevState
    }
    else {
      prevState.liveValue.disconnectDependencies()
      return {
        props,
        liveValue: toLiveValue(props)
      }
    }
  })[0]
  return state.liveValue
  */

  return useMemo(()=>{
    if (typeof(props) === "function") {
      return new LiveValue(props)
    }
    else {
      return props
    }
  }, [props])
}
