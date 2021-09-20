import {useLiveValue} from "../useLiveValue"
import {LiveValue} from "../LiveValue"
import {renderHook, act} from "@testing-library/react-hooks"

function listenerCount<T>(liveValue:LiveValue<T>) {
  if (liveValue.listeners.listeners == null) {
    return 0
  }
  else {
    return liveValue.listeners.listeners.length
  }
}

function firstListener<T>(liveValue:LiveValue<T>) {
  if (liveValue.listeners.listeners == null ||
      liveValue.listeners.listeners.length == 0) {
    return null
  }
  else {
    return liveValue.listeners.listeners[0]
  }
}

describe("useLiveValue", () => {
  describe("with a LiveValue that is assigned a value", ()=>{
    it("should return the LiveValue's value", ()=>{
      const lv1 = new LiveValue(10)

      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(10)
    })
    it("should rerender if the LiveValue changes", ()=>{
      const lv1 = new LiveValue(10)
      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(10)
      act(()=>{
        lv1.value = 11
      })
      expect(result.result.all.length).toBe(2)
      expect(result.result.current).toBe(11)
    })
    it("remove its listener if the component is unmounted", ()=>{
      const lv1 = new LiveValue(10)
      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})

      expect(listenerCount(lv1)).toBe(1)
      result.unmount()
      expect(listenerCount(lv1)).toBe(0)

      act(()=>{
        lv1.value = 11
      })
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(10)
    })
    it("move its listener if rendered with a new LiveValue", ()=>{
      const lv1 = new LiveValue(10)
      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})

      expect(listenerCount(lv1)).toBe(1)
      const l1 = firstListener(lv1)

      const lv2 = new LiveValue(50)

      result.rerender(lv2)

      expect(listenerCount(lv1)).toBe(0)
      expect(listenerCount(lv2)).toBe(1)
      expect(firstListener(lv2)).toBe(l1)

      expect(result.result.all).toEqual([10, 50])
      expect(result.result.current).toBe(50)
    })
  })
})