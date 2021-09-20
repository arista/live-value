import {useForceRerender} from "./useForceRerender"
import {LiveValue} from "./LiveValue"
import {useEffect} from "react"

export function useLiveValue<T>(liveValue:LiveValue<T>):T {
  const listenerFunc = useForceRerender()

  useEffect(()=>{
    liveValue.addListener(listenerFunc)
    return ()=>{
      liveValue.removeListener(listenerFunc)
    }
  }, [liveValue])
  
  return liveValue.value
}
