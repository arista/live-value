import {useState} from "react"

// Returns a function that, when called, will force a re-render of the
// containing component
export function useForceRerender() {
  const setCount = useState(0)[1]

  // The rerender function forces an update by guaranteeing that a new
  // value is set into useState, by using a counter.  To guarantee
  // that the rerender function itself doesn't change, we put that in
  // its own useState.  The function itself is buried in an anonymous
  // function to avoid re-creating it on every re-render.
  const [rerender] = useState(()=>{
    let count = 1
    return ()=>{
      setCount(count++)
    }
  })

  return rerender
}
