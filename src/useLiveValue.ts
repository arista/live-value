import {useForceRerender} from "./useForceRerender"
import {LiveValue} from "./LiveValue"
import {useState, useEffect} from "react"
import {useOrCreateLiveValue} from "./useOrCreateLiveValue"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

export type useLiveValueProps<T> = LiveValue<T> | (() => T)

export function useLiveValue<T>(
  props: useLiveValueProps<T>,
  name: NameInit = null
): T {
  const [_name] = useState(() => nameInitToName(name, "useLiveValue"))
  const listenerFunc = useForceRerender(_name)
  const liveValue = useOrCreateLiveValue(props, _name)

  useEffect(() => {
    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "ConnectingUseLiveValue",
        useLiveValueName: _name,
        liveValueName: liveValue.name,
        liveValue: liveValue,
      })
    }

    liveValue.addListener(listenerFunc, _name)
    return () => {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "DisconnectingUseLiveValue",
          useLiveValueName: _name,
          liveValueName: liveValue.name,
          liveValue: liveValue,
        })
      }
      liveValue.removeListener(listenerFunc)
    }
  }, [liveValue])

  return liveValue.value
}
