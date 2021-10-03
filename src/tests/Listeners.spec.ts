import {Listeners} from "../Listeners"

describe("Listeners", () => {
  describe("add", () => {
    it("should add the listener, which will be called on notify", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      expect(l1val).toBe(0)

      l.add(l1)

      l.notify()
      expect(l1val).toBe(1)
    })
    it("should not add the listener more than once", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      expect(l1val).toBe(0)

      l.add(l1)
      l.add(l1)

      l.notify()
      expect(l1val).toBe(1)
    })
    it("should allow multiple listeners to be added", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      expect(l1val).toBe(0)

      let l2val = 0
      const l2 = () => l2val--
      expect(l2val).toBe(0)

      l.add(l1)
      l.add(l2)

      l.notify()
      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)
    })
    it("retain listeners across multiple notify calls", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      expect(l1val).toBe(0)

      let l2val = 0
      const l2 = () => l2val--
      expect(l2val).toBe(0)

      l.add(l1)
      l.add(l2)

      l.notify()
      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)

      l.notify()
      expect(l1val).toBe(2)
      expect(l2val).toBe(-2)
    })
  })
  describe("remove", () => {
    it("should not fail if removing a listener that was not added", () => {
      const l = new Listeners("name")
      let l1val = 0
      const l1 = () => l1val++

      l.remove(l1)
    })
    it("should not notify a listener that was removed", () => {
      const l = new Listeners("name")
      let l1val = 0
      const l1 = () => l1val++

      l.add(l1)
      l.notify()
      expect(l1val).toBe(1)

      l.remove(l1)
      l.notify()
      expect(l1val).toBe(1)
    })
    it("should remove one listener from among multiple", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      expect(l1val).toBe(0)

      let l2val = 0
      const l2 = () => l2val--
      expect(l2val).toBe(0)

      l.add(l1)
      l.add(l2)

      l.notify()
      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)

      l.remove(l1)
      l.notify()
      expect(l1val).toBe(1)
      expect(l2val).toBe(-2)
    })
  })
  describe("notify", () => {
    it("should not fail if there are no listeners", () => {
      const l = new Listeners("name")
      l.notify()
    })
    it("should call all of the added listeners", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => l1val++
      l.add(l1)
      expect(l1val).toBe(0)

      let l2val = 0
      const l2 = () => l2val--
      l.add(l2)
      expect(l2val).toBe(0)

      l.notify()

      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)
    })
    it("should call the listeners in place at the time of the call, even if the list is notified later", () => {
      const l = new Listeners("name")

      let l1val = 0
      const l1 = () => {
        l1val++
        l.remove(l1)
        l.remove(l2)
        l.add(l3)
      }
      l.add(l1)
      expect(l1val).toBe(0)

      let l2val = 0
      const l2 = () => {
        l2val--
        l.remove(l1)
        l.remove(l2)
        l.add(l3)
      }
      l.add(l2)
      expect(l2val).toBe(0)

      let l3val = 0
      const l3 = () => l3val++
      expect(l3val).toBe(0)

      l.notify()

      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)
      expect(l3val).toBe(0)

      l.notify()

      expect(l1val).toBe(1)
      expect(l2val).toBe(-1)
      expect(l3val).toBe(1)
    })
  })
})
