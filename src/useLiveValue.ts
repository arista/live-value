import {useForceRerender} from "./useForceRerender"
import {LiveValue} from "./LiveValue"
import {useState, useEffect} from "react"
import {useOrCreateLiveValue} from "./useOrCreateLiveValue"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

export type useLiveValueProps<T> = LiveValue<T> | (() => T)

export function useLiveValue<T>(props: useLiveValueProps<T>, name:NameInit = null): T {
  const [id] = useState(()=>LiveValueDebug.nextId)
  const _name = nameInitToName(name, id, "useLiveValue")

  const listenerFunc = useForceRerender()
  const liveValue = useOrCreateLiveValue(props, _name)

  useEffect(() => {
    liveValue.addListener(listenerFunc, _name)
    return () => {
      liveValue.removeListener(listenerFunc)
    }
  }, [liveValue])

  return liveValue.value
}
