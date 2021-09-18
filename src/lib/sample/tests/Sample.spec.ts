import {Sample} from "../Sample"

describe("Sample", () => {
  describe("value", () => {
    it("should return 1", () => {
      const s = new Sample()
      expect(s.value).toBe(1)
    })
  })
})
