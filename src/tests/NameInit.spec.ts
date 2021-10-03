import {NameInit, nameInitToName} from "../NameInit"

describe("NameInit", () => {
  describe("nameInitToName", () => {
    it("should return the string if passed a string", ()=>{
      expect(nameInitToName("abc", 3, "pp")).toBe("abc")
    })
    it("should return the result of applying the function if passed a function", ()=>{
      expect(nameInitToName(id=>`yes${id}`, 3, "pp")).toBe("yes3")
    })
    it("should return the generated name if passed null", ()=>{
      expect(nameInitToName(null, 3, "pp")).toBe("pp#3")
    })
  })
})
