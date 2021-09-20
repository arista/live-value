import {LiveValue} from "../LiveValue"

describe("LiveValue", ()=>{
  describe("with a non-function value", ()=>{
    it("should return the value in a getter", ()=>{
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)
    })
    it("should notify listeners if a new value is assigned", ()=>{
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)

      let lcnt1 = 0
      const l1 = ()=>lcnt1++
      lv.addListener(l1)
      expect(lcnt1).toBe(0)

      lv.value = 11
      expect(lv.value).toBe(11)
      expect(lcnt1).toBe(1)

      lv.value = 12
      expect(lv.value).toBe(12)
      expect(lcnt1).toBe(2)
    })
    it("should not notify listeners if assigned an unchanged value", ()=>{
      const lv = new LiveValue(10)
      expect(lv.value).toBe(10)

      let lcnt1 = 0
      const l1 = ()=>lcnt1++
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
  describe("with a function value", ()=>{
    it("should not call the function when first created", ()=>{
      let lv1count = 0
      const lv1 = new LiveValue(()=>{
        lv1count++
        return 6
      })
      expect(lv1count).toBe(0)
    })
    it("should call the function the first time it is accessed", ()=>{
      let lv1count = 0
      const lv1 = new LiveValue(()=>{
        lv1count++
        return 6
      })
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
    })
    it("should not call the function again if accessed again", ()=>{
      let lv1count = 0
      const lv1 = new LiveValue(()=>{
        lv1count++
        return 6
      })
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
      expect(lv1.value).toBe(6)
      expect(lv1count).toBe(1)
    })
    it("should not the function again if accessed after a dependent is changed", ()=>{
      let lv1count = 0
      const lv1 = new LiveValue(()=>{
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
    // FIXME - two levels deep
    // FIXME - with multiple dependencies
    // FIXME - depending on the same thing multiple times
    // FIXME - switching dependencies
  })
  describe("assigning function and non-function values", ()=>{
    // FIXME - implement this
  })
})
