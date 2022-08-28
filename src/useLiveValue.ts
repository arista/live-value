import {LiveValue} from "./LiveValue"
import {useState, useEffect} from "react"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

// Generates a stable name from the given nameProp, updating that name
// if the nameProp is changed
function useLiveValueName(nameProp: NameInit): string {
  const [{name, prevNameProp}, setName] = useState(() => {
    return {
      name: nameInitToName(nameProp, "useLiveValue"),
      prevNameProp: nameProp,
    }
  })

  // useEffect detects changes to nameProp and calls setName
  // accordingly.  However, useEffect always runs at least once, which
  // would have the undesired effect of generating the name at least
  // twice when the component is mounted (once in the useState above,
  // once in the useEffect).  To avoid this, we keep "prevNameProp" in
  // our state to track the nameProp that was used to create the
  // current name, and do our own change check.  This causes the
  // setName to be skipped the first time useEffect is called, but
  // called for subsequent changes to nameProp.
  useEffect(() => {
    if (nameProp !== prevNameProp) {
      setName({
        name: nameInitToName(nameProp, "useLiveValue"),
        prevNameProp: nameProp,
      })
    }
  }, [nameProp, prevNameProp])

  return name
}

// Sets up useEffect to subscribe to the liveValue, then unsubscribe
// on cleanup
function useSubscribedLiveValue<T>(
  liveValue: LiveValue<T>,
  name: string,
  setValue: (newVal: T) => void
): void {
  useEffect(() => {
    const listener = () => {
      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "RerenderingUseLiveValue",
          useLiveValueName: name,
        })
      }
      setValue(liveValue.value)
    }
    // DebugEvent
    LiveValueDebug.logDebug({
      type: "ConnectingUseLiveValue",
      useLiveValueName: name,
      liveValueName: liveValue.name,
      liveValue: liveValue,
    })
    setValue(liveValue.value)
    liveValue.addListener(listener, name)
    return () => {
      // DebugEvent
      LiveValueDebug.logDebug({
        type: "DisconnectingUseLiveValue",
        useLiveValueName: name,
        liveValueName: liveValue.name,
        liveValue: liveValue,
      })
      liveValue.removeListener(listener)
    }
  }, [liveValue, name, setValue])
}

// Emit a debug event on initial mount
function useDebugOnMount(name: string) {
  const cval = 1
  useEffect(() => {
    LiveValueDebug.logDebug({
      type: "MountingUseLiveValue",
      useLiveValueName: name,
    })
  }, [cval, name])
}

// Emit a debug event on final unmount
function useDebugOnUnmount(name: string) {
  // Emit a debug event on unmount
  useEffect(() => {
    return () => {
      LiveValueDebug.logDebug({
        type: "UnmountingUseLiveValue",
        useLiveValueName: name,
      })
    }

    // We want the array to be empty so this is only called on
    // unmount, even though we technically depend on name.  In
    // practice, it's unlikely that name will change all that often.
    
    // eslint-disable-next-line
  }, [])
}

export function useLiveValue<T>(
  liveValue: LiveValue<T>,
  nameProp: NameInit = null
): T {
  const name = useLiveValueName(nameProp)

  useDebugOnMount(name)
  useDebugOnUnmount(name)

  const [value, setValue] = useState(() => liveValue.value)
  useSubscribedLiveValue(liveValue, name, setValue)

  return value
}
