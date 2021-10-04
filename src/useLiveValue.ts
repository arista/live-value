import {useForceRerender} from "./useForceRerender"
import {LiveValue} from "./LiveValue"
import {useState, useEffect} from "react"
import {useOrCreateLiveValue} from "./useOrCreateLiveValue"
import {LiveValueDebug} from "./LiveValueDebug"
import {NameInit, nameInitToName} from "./NameInit"

export type LiveValueProp<T> = LiveValue<T> | (() => T)

class UseLiveValueState<T> {
  initialized = false

  forceRerenderFunc!: ()=>void
  forceRerenderCounter = 1

  latestLiveValueProp!: LiveValueProp<T>
  latestNameProp!: NameInit

  name!: string
  liveValue!: LiveValue<T>
  
  onRender(liveValueProp: LiveValueProp<T>, nameProp: NameInit):T {
    const setCount = useState(0)[1]
    useEffect(()=>{
      return ()=>this.disconnectFromLiveValue()
    })

    if (!this.initialized) {
      // Set up the function that will effectively force rerendering by
      // incrementing a counter
      this.forceRerenderFunc = ()=>setCount(this.forceRerenderCounter++)

      // Set up the name and value
      this.initializeNameAndLiveValue(liveValueProp, nameProp)
      this.connectToLiveValue()
      this.initialized = true
    }
    else if (this.latestLiveValueProp !== liveValueProp ||
             this.latestNameProp !== nameProp) {
      // Re-set up the name and value
      this.disconnectFromLiveValue()
      this.initializeNameAndLiveValue(liveValueProp, nameProp)
      this.connectToLiveValue()
    }
    this.latestLiveValueProp = liveValueProp
    this.latestNameProp = nameProp

    return this.liveValue.value
  }

  initializeNameAndLiveValue(liveValueProp: LiveValueProp<T>, nameProp: NameInit) {
    this.name = nameInitToName(nameProp, "useLiveValue")
    this.liveValue = (typeof liveValueProp === "function")
      ? new LiveValue(liveValueProp, this.name)
      : liveValueProp
  }

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
    this.liveValue.removeListener(this.forceRerenderFunc)
  }

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
  const state = useState(()=>new UseLiveValueState<T>())[0]
  return state.onRender(liveValue, name)
}
