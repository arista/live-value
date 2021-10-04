import {useForceRerender} from "../useForceRerender"
import {renderHook, act} from "@testing-library/react-hooks"

describe("useForceRerender", () => {
  it("return a function that forces a re-render", () => {
    const result = renderHook(() => useForceRerender("name1"))
    expect(result.result.all.length).toBe(1)
    const updateFunc = result.result.current
    expect(typeof updateFunc).toBe("function")

    // Call the function
    act(() => updateFunc())

    // It should have rerendered
    expect(result.result.all.length).toBe(2)

    // It should have returned the same function
    const newUpdateFunc = result.result.current
    expect(newUpdateFunc).toBe(updateFunc)
  })
})
