import {LiveValue, DebugEvent} from "../LiveValue"
import {LiveValueDebug} from "../LiveValueDebug"
import {useLiveValue} from "../useLiveValue"
import {renderHook, act} from "@testing-library/react-hooks"

beforeEach(()=>LiveValueDebug.resetIdCounter())

describe("LiveValueDebug", () => {
  describe("generating strings", ()=>{
    it("should generate the expected strings", ()=>{
      const msgs:Array<string> = []
      const listener = (e:DebugEvent)=>msgs.push(LiveValue.debugEventToString(e))
      LiveValue.addDebugListener(listener)

      const lv1 = new LiveValue("abc", "lv1")
      const lv2 = new LiveValue("def", "lv2")
      const lv3 = new LiveValue(()=>lv1.value + lv2.value)

      expect(lv3.value).toEqual("abcdef")

      lv3.onChange()
      lv3.onMatch(v=>v === "abcdefgh")

      const hookResult = renderHook((lv: LiveValue<string>) => useLiveValue(lv), {
        initialProps: lv3,
      })

      act(()=>{
        lv2.value += "g"
        lv2.value += "h"
      })

      const expected = [
        `Creating LiveValue "lv1" with initial value <abc>`,
        `Creating LiveValue "lv2" with initial value <def>`,
        `Creating computed LiveValue "LiveValue#1"`,
        `Computing LiveValue "LiveValue#1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv1"`,
        `Added listener "LiveValue#1" to LiveValue "lv1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv2"`,
        `Added listener "LiveValue#1" to LiveValue "lv2"`,
        `Computed LiveValue "LiveValue#1" as <abcdef>`,
        `Starting onChange "onChange#2 on LiveValue "LiveValue#1"`,
        `Added listener "onChange#2" to LiveValue "LiveValue#1"`,
        `Starting onMatch "onMatch#3 on LiveValue "LiveValue#1"`,
        `Added listener "onMatch#3" to LiveValue "LiveValue#1"`,
        `Connecting useLiveValue "useLiveValue#4" to LiveValue "LiveValue#1"`,
        `Added listener "useLiveValue#4" to LiveValue "LiveValue#1"`,
        `Changed LiveValue "lv2" value from <def> to <defg>`,
        `Notifying 1 listener of LiveValue "lv2"`,
        `Notifying listener LiveValue#1 of LiveValue "lv2"`,
        `LiveValue "LiveValue#1" no longer depends on LiveValue "lv1"`,
        `Removed listener "LiveValue#1" from LiveValue "lv1"`,
        `LiveValue "LiveValue#1" no longer depends on LiveValue "lv2"`,
        `Removed listener "LiveValue#1" from LiveValue "lv2"`,
        `Invalidated computed LiveValue "LiveValue#1" with old value <abcdef>`,
        `Notifying 3 listeners of LiveValue "LiveValue#1"`,
        `Notifying listener onChange#2 of LiveValue "LiveValue#1"`,
        `Computing LiveValue "LiveValue#1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv1"`,
        `Added listener "LiveValue#1" to LiveValue "lv1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv2"`,
        `Added listener "LiveValue#1" to LiveValue "lv2"`,
        `Computed LiveValue "LiveValue#1" as <abcdefg>`,
        `Removed listener "onChange#2" from LiveValue "LiveValue#1"`,
        `Resolving onChange "onChange#2 on LiveValue "LiveValue#1" with value abcdefg`,
        `Notifying listener onMatch#3 of LiveValue "LiveValue#1"`,
        `Notifying listener useLiveValue#4 of LiveValue "LiveValue#1"`,
        `Rerendering useLiveValue "useLiveValue#4"`,
        `Changed LiveValue "lv2" value from <defg> to <defgh>`,
        `Notifying 1 listener of LiveValue "lv2"`,
        `Notifying listener LiveValue#1 of LiveValue "lv2"`,
        `LiveValue "LiveValue#1" no longer depends on LiveValue "lv1"`,
        `Removed listener "LiveValue#1" from LiveValue "lv1"`,
        `LiveValue "LiveValue#1" no longer depends on LiveValue "lv2"`,
        `Removed listener "LiveValue#1" from LiveValue "lv2"`,
        `Invalidated computed LiveValue "LiveValue#1" with old value <abcdefg>`,
        `Notifying 2 listeners of LiveValue "LiveValue#1"`,
        `Notifying listener onMatch#3 of LiveValue "LiveValue#1"`,
        `Computing LiveValue "LiveValue#1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv1"`,
        `Added listener "LiveValue#1" to LiveValue "lv1"`,
        `LiveValue "LiveValue#1" depends on LiveValue "lv2"`,
        `Added listener "LiveValue#1" to LiveValue "lv2"`,
        `Computed LiveValue "LiveValue#1" as <abcdefgh>`,
        `Removed listener "onMatch#3" from LiveValue "LiveValue#1"`,
        `Resolving onMatch "onMatch#3 on LiveValue "LiveValue#1" with value abcdefgh`,
        `Notifying listener useLiveValue#4 of LiveValue "LiveValue#1"`,
        `Rerendering useLiveValue "useLiveValue#4"`,
      ]
      expect(expected).toEqual(msgs)
    })
  })
})
