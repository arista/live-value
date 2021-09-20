import {useForceRerender} from "./useForceRerender"
import {LiveValue} from "./LiveValue"
import {useEffect} from "react"
import {useOrCreateLiveValue} from "./useOrCreateLiveValue"

export type useLiveValueProps<T> =
  LiveValue<T> |
  (()=>T)

export function useLiveValue<T>(props:useLiveValueProps<T>):T {
  const listenerFunc = useForceRerender()
  const liveValue = useOrCreateLiveValue(props)

  useEffect(()=>{
    liveValue.addListener(listenerFunc)
    return ()=>{
      liveValue.removeListener(listenerFunc)
    }
  }, [liveValue])
  
  return liveValue.value
}
