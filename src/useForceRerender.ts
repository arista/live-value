import {useState} from "react"

// Returns a function that, when called, will force a re-render of the
// containing component
export function useForceRerender() {
  const [count, setCount] = useState(0)

  // The rerender function forces an update by guaranteeing tha a new
  // value is set into useState, by using a counter.  To guarantee
  // that the rerender function itself doesn't change, we put that in
  // its own useState.  The function itself is buried in an anonymous
  // function to avoid re-creating it on every re-render.
  const [rerender] = useState(()=>{
    return ()=>setCount(count + 1)
  })

  return rerender
}
