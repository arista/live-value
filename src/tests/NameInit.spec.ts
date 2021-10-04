import {NameInit, nameInitToName} from "../NameInit"
import {LiveValueDebug} from "../LiveValueDebug"

describe("NameInit", () => {
  describe("nameInitToName", () => {
    beforeEach(() => LiveValueDebug.resetIdCounter())

    it("should return the string if passed a string", () => {
      expect(nameInitToName("abc", "pp")).toBe("abc")
    })
    it("should return the result of applying the function if passed a function", () => {
      expect(nameInitToName((id) => `yes${id}`, "pp")).toBe("yes1")
    })
    it("should return the generated name if passed null", () => {
      expect(nameInitToName(null, "pp")).toBe("pp#1")
    })
  })
})
