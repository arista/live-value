import {LiveValueDebug} from "./LiveValueDebug"

export type NameInitFn = (id: number) => string

export type NameInit = string | NameInitFn | null

export function nameInitToName(nameInit: NameInit, prefix: string): string {
  if (typeof nameInit === "string") {
    return nameInit
  } else if (typeof nameInit === "function") {
    const id = LiveValueDebug.nextId()
    return nameInit(id)
  } else {
    const id = LiveValueDebug.nextId()
    return `${prefix}#${id}`
  }
}
