import {useOrCreateLiveValue} from "../useOrCreateLiveValue"
import {useLiveValueProps} from "../useLiveValue"
import {LiveValue} from "../LiveValue"
import {renderHook, act} from "@testing-library/react-hooks"

function trackDisconnectCalls<T>(liveValue: LiveValue<T>) {
  const ret = {
    disconnectDependenciesCount: 0,
  }
  const origDisconnect = liveValue.disconnectDependencies
  const disconnect = jest.fn(() => {
    ret.disconnectDependenciesCount++
    origDisconnect.call(liveValue)
  })
  liveValue.disconnectDependencies = disconnect
  return ret
}

describe("useOrCreateLiveValue", () => {
  describe("when passed a LiveValue", () => {
    it("should return that value", () => {
      const lv1 = new LiveValue(10)
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: lv1,
        }
      )
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(lv1)

      // Rerender
      result.rerender(lv1)
      expect(result.result.all.length).toBe(2)
      expect(result.result.current).toBe(lv1)
    })
    it("should return different values if rerendered with different values", () => {
      const lv1 = new LiveValue(10)
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: lv1,
        }
      )
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(lv1)

      const lv2 = new LiveValue(20)

      // Rerender
      result.rerender(lv2)
      // See useOrCreateLiveValue for why this ends up being a double-rerender
      expect(result.result.all.length).toBe(3)
      expect(result.result.current).toBe(lv2)
    })
    it("should return a different LiveValue if later called with a function", () => {
      const lv1 = new LiveValue(10)
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: lv1,
        }
      )
      expect(result.result.all.length).toBe(1)
      expect(result.result.current).toBe(lv1)

      // Rerender
      const f = () => lv1.value * 2
      result.rerender(f as any)
      // See useOrCreateLiveValue for why this ends up being a double-rerender
      expect(result.result.all.length).toBe(3)
      const lv2 = result.result.current
      expect(lv2.value).toBe(20)
      expect(lv2).not.toBe(lv1)
    })
  })
  describe("when passed a function", () => {
    it("should return a LiveValue from that function", () => {
      const lv1 = new LiveValue(10)
      const f = () => lv1.value * 2
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: f,
        }
      )

      expect(result.result.all.length).toBe(1)
      const lv2 = result.result.current
      expect(lv2 instanceof LiveValue)
      expect(lv2.value).toBe(20)

      // Re-rendering should return the same LiveValue
      result.rerender(f)
      expect(result.result.all.length).toBe(2)
      expect(result.result.current).toBe(lv2)
    })
    it("should return a different LiveValue if passed a different function", () => {
      const lv1 = new LiveValue(10)
      const f1 = () => lv1.value * 2
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: f1,
        }
      )

      expect(result.result.all.length).toBe(1)
      const lv2 = result.result.current
      expect(lv2 instanceof LiveValue)
      expect(lv2.value).toBe(20)

      let disconnectCounts = trackDisconnectCalls(lv2)

      // Re-render with new value
      const f2 = () => lv1.value * 3
      result.rerender(f2)
      // See useOrCreateLiveValue for why this ends up being a double-rerender
      expect(result.result.all.length).toBe(3)
      const lv3 = result.result.current
      expect(lv3).not.toBe(lv2)
      expect(lv3.value).toBe(30)

      // The original LiveValue should have been disconnected
      expect(disconnectCounts.disconnectDependenciesCount).toBe(1)
    })
    it("should return a different LiveValue if later passed a non-function LiveValue", () => {
      const lv1 = new LiveValue(10)
      const f1 = () => lv1.value * 2
      const result = renderHook(
        (props: useLiveValueProps<number>) => useOrCreateLiveValue(props),
        {
          initialProps: f1,
        }
      )

      expect(result.result.all.length).toBe(1)
      const lv2 = result.result.current
      expect(lv2 instanceof LiveValue)
      expect(lv2.value).toBe(20)

      let disconnectCounts = trackDisconnectCalls(lv2)

      const lv3 = new LiveValue(30)
      result.rerender(lv3 as any)
      // See useOrCreateLiveValue for why this ends up being a double-rerender
      expect(result.result.all.length).toBe(3)
      expect(result.result.current).toBe(lv3)
      expect(lv3.value).toBe(30)

      // The original LiveValue should have been disconnected
      expect(disconnectCounts.disconnectDependenciesCount).toBe(1)
    })
  })
})
