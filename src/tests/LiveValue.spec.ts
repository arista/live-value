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
})
