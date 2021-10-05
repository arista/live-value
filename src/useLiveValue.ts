import {LiveValue} from "./LiveValue"
import {useState, useEffect} from "react"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

export type LiveValueProp<T> = LiveValue<T> | (() => T)

class UseLiveValueState<T> {
  isFirstRender = true

  // The callback function that will act as a Listener on the
  // LiveValue
  forceRerenderFunc!: () => void

  // Keep track of the values passed in on the previous render
  latestLiveValueProp!: LiveValueProp<T>
  latestNameProp!: NameInit

  // The name assigned to the useLiveValue instance
  name!: string

  // The current LiveValue this is listening to
  liveValue!: LiveValue<T>

  // Call with every render
  onRender(liveValueProp: LiveValueProp<T>, nameProp: NameInit): T {
    // The state update function used to force re-renders
    const setCount = useState(0)[1]

    // Set up a callback for when the component is unmounted
    useEffect(() => {
      return () => {
        // DebugEvent
        if (LiveValueDebug.isLogging) {
          LiveValueDebug.logDebug({
            type: "UnmountingUseLiveValue",
            useLiveValueName: this.name,
          })
        }
        this.disconnectFromLiveValue()
      }
    }, [])

    if (this.isFirstRender) {
      // Set up the function that will effectively force rerendering by
      // incrementing a counter
      let count = 1
      this.forceRerenderFunc = () => {
        // DebugEvent
        if (LiveValueDebug.isLogging) {
          LiveValueDebug.logDebug({
            type: "RerenderingUseLiveValue",
            useLiveValueName: this.name,
          })
        }
        setCount(count++)
      }

      // Set up the name and value
      this.initializeNameAndLiveValue(liveValueProp, nameProp)

      // DebugEvent
      if (LiveValueDebug.isLogging) {
        LiveValueDebug.logDebug({
          type: "MountingUseLiveValue",
          useLiveValueName: this.name,
        })
      }

      this.connectToLiveValue()
      this.isFirstRender = false
    } else if (
      this.latestLiveValueProp !== liveValueProp ||
      this.latestNameProp !== nameProp
    ) {
      // Reset the name and value
      this.disconnectFromLiveValue()
      this.initializeNameAndLiveValue(liveValueProp, nameProp)
      this.connectToLiveValue()
    }

    // Remember the latest values passed in so we can determine if
    // they've changed on the next render
    this.latestLiveValueProp = liveValueProp
    this.latestNameProp = nameProp

    return this.liveValue.value
  }

  initializeNameAndLiveValue(
    liveValueProp: LiveValueProp<T>,
    nameProp: NameInit
  ) {
    this.name = nameInitToName(nameProp, "useLiveValue")

    // Use the given LiveValue, or create a computed LiveValue if a
    // function was passed in.
    this.liveValue =
      typeof liveValueProp === "function"
        ? new LiveValue(liveValueProp, this.name)
        : liveValueProp
  }

  // Removes any listeners from the current LiveValue
  disconnectFromLiveValue() {
    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "DisconnectingUseLiveValue",
        useLiveValueName: this.name,
        liveValueName: this.liveValue.name,
        liveValue: this.liveValue,
      })
    }
    this.liveValue.disconnectDependencies()
    this.liveValue.removeListener(this.forceRerenderFunc)
  }

  // Adds a listener to the current LiveValue
  connectToLiveValue() {
    // DebugEvent
    if (LiveValueDebug.isLogging) {
      LiveValueDebug.logDebug({
        type: "ConnectingUseLiveValue",
        useLiveValueName: this.name,
        liveValueName: this.liveValue.name,
        liveValue: this.liveValue,
      })
    }
    this.liveValue.addListener(this.forceRerenderFunc, this.name)
  }
}

export function useLiveValue<T>(
  liveValue: LiveValueProp<T>,
  name: NameInit = null
): T {
  // Construct a UseLiveValueState once, call onRender on it each time
  const state = useState(() => new UseLiveValueState<T>())[0]
  return state.onRender(liveValue, name)
}
