import {LiveValue} from "../LiveValue"

afterEach(() => jest.useRealTimers())

function waitImmediate(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve))
}

function setupOnChange(
  timeoutMsec: number | null = null,
  assignValue: boolean = true
) {
  const calls: Array<number> = []
  const errors: Array<Error> = []
  const lv = assignValue ? new LiveValue(10) : new LiveValue<number>()
  const p = timeoutMsec != null ? lv.onChange(timeoutMsec) : lv.onChange()
  p.then((val) => calls.push(val)).catch((e) => errors.push(e))
  expect(calls).toEqual([])
  expect(errors).toEqual([])

  return {lv, calls, errors}
}

function setupOnMatch(
  timeoutMsec: number | null = null,
  assignValue: boolean = true,
  assignedValue: number | null = null
) {
  const calls: Array<number> = []
  const errors: Array<Error> = []
  const lv = assignValue
    ? new LiveValue(assignedValue == null ? 10 : assignedValue)
    : new LiveValue<number>()
  const test = (v: number) => v === 30
  const p =
    timeoutMsec != null ? lv.onMatch(test, timeoutMsec) : lv.onMatch(test)
  p.then((val) => calls.push(val)).catch((e) => errors.push(e))
  expect(calls).toEqual([])
  expect(errors).toEqual([])

  return {lv, calls, errors}
}

describe("LiveValue", () => {
  describe("with a non-function value", () => {
    it("should return the value in a getter", () => {
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)
    })
    it("should notify listeners if a new value is assigned", () => {
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)

      let lcnt1 = 0
      const l1 = () => lcnt1++
      lv.addListener(l1)
      expect(lcnt1).toBe(0)

      lv.value = 11
      expect(lv.value).toBe(11)
      expect(lcnt1).toBe(1)

      lv.value = 12
      expect(lv.value).toBe(12)
      expect(lcnt1).toBe(2)
    })
    it("should not notify listeners if assigned an unchanged value", () => {
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)

      let lcnt1 = 0
      const l1 = () => lcnt1++
      lv.addListener(l1)
      expect(lcnt1).toBe(0)

      lv.value = 11
      expect(lv.value).toBe(11)
      expect(lcnt1).toBe(1)

      lv.value = 11
      expect(lv.value).toBe(11)
      expect(lcnt1).toBe(1)
    })
  })
  describe("with a function value", () => {
    it("should not call the function when first created", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return 6
      })
      expect(lv1count).toBe(0)
    })
    it("should call the function the first time it is accessed", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return 6
      })
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
    })
    it("should not call the function again if accessed again", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return 6
      })
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
    })
    it("should call the function again if accessed after a dependent is changed", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value * 2
      })
      const lv2 = new LiveValue(6)

      expect(lv1.value).toBe(12)
      expect(lv1count).toBe(1)
      expect(lv1.value).toBe(12)
      expect(lv1count).toBe(1)

      lv2.value = 8
      expect(lv1.value).toBe(16)
      expect(lv1count).toBe(2)
    })
    it("should detect dependency changes two levels deep", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value * 2
      })

      let lv2count = 0
      const lv2 = new LiveValue(() => {
        lv2count++
        return lv3.value + 1
      })

      const lv3 = new LiveValue(10)

      expect(lv1.value).toBe(22)
      expect(lv1count).toBe(1)
      expect(lv2count).toBe(1)

      lv3.value = 20
      expect(lv1count).toBe(1)
      expect(lv2count).toBe(1)

      expect(lv1.value).toBe(42)
      expect(lv1count).toBe(2)
      expect(lv2count).toBe(2)
    })
    it("should detect changes in multiple dependencies", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value + lv3.value
      })

      const lv2 = new LiveValue(10)
      const lv3 = new LiveValue(20)

      expect(lv1.value).toBe(30)
      expect(lv1count).toBe(1)

      lv2.value++
      expect(lv1.value).toBe(31)
      expect(lv1count).toBe(2)

      lv3.value++
      expect(lv1.value).toBe(32)
      expect(lv1count).toBe(3)

      lv2.value++
      lv3.value++
      expect(lv1.value).toBe(34)
      expect(lv1count).toBe(4)
    })
    it("should handle using the same dependency multiple times", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value + lv2.value
      })

      const lv2 = new LiveValue(10)

      expect(lv1.value).toBe(20)
      expect(lv1count).toBe(1)

      lv2.value++
      expect(lv1.value).toBe(22)
      expect(lv1count).toBe(2)
    })
    it("should handle switching between dependencies", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value ? lv3.value : lv4.value
      })

      const lv2 = new LiveValue(true)

      let lv3count = 0
      const lv3 = new LiveValue(() => {
        lv3count++
        return lv3a.value
      })
      const lv3a = new LiveValue(10)

      let lv4count = 0
      const lv4 = new LiveValue(() => {
        lv4count++
        return lv4a.value
      })
      const lv4a = new LiveValue(20)

      expect(lv1.value).toBe(10)
      expect(lv1count).toBe(1)
      expect(lv3count).toBe(1)
      expect(lv4count).toBe(0)

      lv3a.value++
      expect(lv1.value).toBe(11)
      expect(lv1count).toBe(2)
      expect(lv3count).toBe(2)
      expect(lv4count).toBe(0)

      lv4a.value++
      expect(lv1.value).toBe(11)
      expect(lv1count).toBe(2)
      expect(lv3count).toBe(2)
      expect(lv4count).toBe(0)

      lv2.value = false
      expect(lv1.value).toBe(21)
      expect(lv1count).toBe(3)
      expect(lv3count).toBe(2)
      expect(lv4count).toBe(1)

      lv3a.value++
      expect(lv1.value).toBe(21)
      expect(lv1count).toBe(3)
      expect(lv3count).toBe(2)
      expect(lv4count).toBe(1)

      lv4a.value++
      expect(lv1.value).toBe(22)
      expect(lv1count).toBe(4)
      expect(lv3count).toBe(2)
      expect(lv4count).toBe(2)
    })
    it("should throw if it references itself", () => {
      const lv1 = new LiveValue((): number => lv1.value + 1)
      expect(() => lv1.value).toThrow(
        new Error(`Computed LiveValue directly or indirectly references itself`)
      )
    })
    it("should throw if it references itself indirectly", () => {
      const lv1 = new LiveValue((): number => lv2.value + 1)
      const lv2 = new LiveValue((): number => lv3.value + 1)
      const lv3 = new LiveValue((): number => lv1.value + 1)
      expect(() => lv1.value).toThrow(
        new Error(`Computed LiveValue directly or indirectly references itself`)
      )
    })
  })
  describe("with no initial value", () => {
    it("should throw when accessed", () => {
      const lv1 = new LiveValue<number>()
      expect(() => lv1.value).toThrow(
        new Error(`LiveValue has not yet been assigned a value or a function`)
      )
    })
    it("should allow an assigned value to be set", () => {
      const lv1 = new LiveValue<number>()
      lv1.value = 10
      expect(lv1.value).toBe(10)
    })
  })
  describe("assigning function and non-function values", () => {
    it("should allow a computed LiveValue to later be assigned a static value", () => {
      let lv1count = 0
      const lv1 = new LiveValue(() => {
        lv1count++
        return lv2.value * 2
      })
      const lv2 = new LiveValue(10)

      let lv3count = 0
      const lv3 = new LiveValue(() => {
        lv3count++
        return lv1.value * 3
      })

      expect(lv1.value).toBe(20)
      expect(lv1count).toBe(1)
      expect(lv3.value).toBe(60)
      expect(lv3count).toBe(1)

      lv2.value++
      expect(lv1.value).toBe(22)
      expect(lv1count).toBe(2)
      expect(lv3.value).toBe(66)
      expect(lv3count).toBe(2)

      lv1.value = 5
      expect(lv1.value).toBe(5)
      expect(lv1count).toBe(2)
      expect(lv3.value).toBe(15)
      expect(lv3count).toBe(3)

      lv2.value++
      expect(lv1.value).toBe(5)
      expect(lv1count).toBe(2)

      lv1.value++
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(2)
      expect(lv3.value).toBe(18)
      expect(lv3count).toBe(4)
    })
  })
  describe("onChange", () => {
    it("should resolve if the value is later changed", async () => {
      const test = setupOnChange()

      // Change the value asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([])
      expect(test.errors).toEqual([])

      // Change the value
      test.lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([20])
      expect(test.errors).toEqual([])
    })
    it("should resolve if the value changes synchronously immediately after onChange is called", async () => {
      const test = setupOnChange()

      // Change the value immediately
      test.lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([20])
      expect(test.errors).toEqual([])
    })
    it("should only reolve once", async () => {
      const test = setupOnChange()

      // Change the value immediately
      test.lv.value = 20

      // Change the value again
      test.lv.value = 30

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([20])
      expect(test.errors).toEqual([])
    })
    it("should reject if the timeout elapses", async () => {
      jest.useFakeTimers()

      const test = setupOnChange(10000)

      // Wait for the timer to elapse
      jest.runAllTimers()

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([])
      expect(test.errors).toEqual([new Error("LiveValue timeout")])
    })
    it("should not reject if the timeout elapses after the value changes", async () => {
      jest.useFakeTimers()

      const test = setupOnChange(10000)

      await waitImmediate()
      test.lv.value = 20

      // Wait for the timer to elapse
      jest.runAllTimers()

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([20])
      expect(test.errors).toEqual([])
    })
    it("after resolving, it should no longer have listeners", async () => {
      const test = setupOnChange()

      // Change the value asynchronously
      await waitImmediate()
      expect(test.lv.listenerCount > 0).toBe(true)
      test.lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.lv.listenerCount).toBe(0)
    })
    it("after timing out, it should no longer have listeners", async () => {
      jest.useFakeTimers()

      const test = setupOnChange(10000)

      await waitImmediate()
      expect(test.lv.listenerCount > 0).toBe(true)

      // Wait for the timer to elapse
      jest.runAllTimers()

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.lv.listenerCount).toBe(0)
    })
    it("work if no value was assigned at first", async () => {
      const test = setupOnChange(null, false)

      // Change the value synchronously
      test.lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([20])
      expect(test.errors).toEqual([])
    })
    it("work for computed values", async () => {
      const calls: Array<number> = []
      const lv = new LiveValue(10)
      const lv2 = new LiveValue(() => lv.value * 2)
      const p = lv2.onChange()
      p.then((val) => calls.push(val))

      expect(lv2.value).toBe(20)
      expect(calls).toEqual([])

      lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(calls).toEqual([40])
    })
    it("should not call if the value hasn't actually changed", async () => {
      const calls: Array<number> = []
      const lv = new LiveValue(10)
      const lv2 = new LiveValue(20)
      const lv3 = new LiveValue(() => lv.value * 0 + lv2.value)
      const p = lv3.onChange()
      p.then((val) => calls.push(val))

      expect(lv3.value).toBe(20)
      expect(calls).toEqual([])

      // Change the value that shouldn't affect lv3
      lv.value = 20

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(calls).toEqual([])

      // Change the value that should affect lv3
      lv2.value = 30

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(calls).toEqual([30])
    })
  })
  describe("onMatch", () => {
    it("should resolve if the value is changed to match", async () => {
      const test = setupOnMatch()

      test.lv.value = 30
      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([30])
    })
    it("should not resolve until the value is changed to match", async () => {
      const test = setupOnMatch()

      test.lv.value = 40
      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([])

      test.lv.value = 30
      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([30])
    })
    it("should resolve immediately if the value already matches", async () => {
      const test = setupOnMatch(null, true, 30)

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([30])
    })
    it("should work if no value was originally assigned", async () => {
      const test = setupOnMatch(null, false)

      test.lv.value = 30
      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([30])
    })
    it("should reject if the timeout elapses", async () => {
      jest.useFakeTimers()

      const test = setupOnMatch(10000)

      // Wait for the timer to elapse
      jest.runAllTimers()

      // node will resolve the Promise asynchronously
      await waitImmediate()
      expect(test.calls).toEqual([])
      expect(test.errors).toEqual([new Error("LiveValue timeout")])
    })
    it("should have no listeners once the value matches", async () => {
      const test = setupOnMatch()
      await waitImmediate()
      expect(test.lv.listenerCount > 0).toBe(true)
      test.lv.value = 40
      await waitImmediate()
      expect(test.lv.listenerCount > 0).toBe(true)
      test.lv.value = 30
      await waitImmediate()
      expect(test.lv.listenerCount == 0).toBe(true)
    })
    it("should have no listeners once the value rejects", async () => {
      jest.useFakeTimers()
      const test = setupOnMatch(10000)
      await waitImmediate()
      expect(test.lv.listenerCount > 0).toBe(true)
      jest.runAllTimers()
      expect(test.lv.listenerCount == 0).toBe(true)
    })
  })
})
