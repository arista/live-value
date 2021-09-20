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

function trackListenerCalls<T>(liveValue:LiveValue<T>) {
  const ret = {
    addListenerCount: 0,
    removeListenerCount: 0,
  }

  const currentAddListener = liveValue.addListener
  const addListener = jest.fn(l=>{
    ret.addListenerCount++
    currentAddListener.call(liveValue, l)
  })
  liveValue.addListener = addListener

  const currentRemoveListener = liveValue.removeListener
  const removeListener = jest.fn(l=>{
    ret.removeListenerCount++
    currentRemoveListener.call(liveValue, l)
  })
  liveValue.removeListener = removeListener

  return ret
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
    it("should not change the listener list when rerendered", ()=>{
      const lv1 = new LiveValue(10)
      const listenerCalls = trackListenerCalls(lv1)
      expect(listenerCalls).toEqual({
        addListenerCount: 0,
        removeListenerCount: 0,
      })
      
      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})
      expect(listenerCalls.addListenerCount).toBe(1)
      expect(listenerCalls.removeListenerCount).toBe(0)

      result.rerender(lv1)
      expect(listenerCalls.addListenerCount).toBe(1)
      expect(listenerCalls.removeListenerCount).toBe(0)
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

      // See useOrCreateLiveValue for why this ends up being two
      // re-renders
      expect(result.result.all).toEqual([10, 50, 50])
      expect(result.result.current).toBe(50)
    })
  })
  describe("with a LiveValue that is computed", ()=>{
    it("should rerender if the dependencies change", ()=>{
      const lv1 = new LiveValue(()=>lv2.value * 2)
      const lv2 = new LiveValue(20)

      const result = renderHook((lv:LiveValue<number>)=>useLiveValue(lv), {initialProps: lv1})
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(40)
      act(()=>{
        lv2.value++
      })
      expect(result.result.all.length).toBe(2)
      expect(result.result.current).toBe(42)

      act(()=>{
        lv1.value = 5
      })
      expect(result.result.all.length).toBe(3)
      expect(result.result.current).toBe(5)
    })
  })
  describe("with a function", ()=>{
    it("should use the value computed from the specified function", ()=>{
      let fcount = 0
      const f = ()=>{
        fcount++
        return 10
      }

      const result = renderHook((lv:(LiveValue<number>|(()=>number)))=>useLiveValue(lv), {initialProps: f})
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(10)
      expect(fcount).toBe(1)

      // It shouldn't call the function again
      result.rerender(f)
      expect(result.result.all.length).toBe(2)
      expect(result.result.current).toBe(10)
      expect(fcount).toBe(1)
      
    })
    it("should use the value computed from the specified function", ()=>{
    })
  })
})
