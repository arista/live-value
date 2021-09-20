import {LiveValue} from "../LiveValue"

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
})
