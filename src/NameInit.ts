export type NameInitFn = (id:number)=>string

export type NameInit = string | NameInitFn | null

export function nameInitToName(nameInit: NameInit, id:number, prefix:string):string {
  if (typeof(nameInit) === "string") {
    return nameInit
  }
  else if (typeof(nameInit) === "function") {
    return nameInit(id)
  }
  else {
    return `${prefix}#${id}`
  }
}
