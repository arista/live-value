export class _LiveValueDebug {
  idCounter = 1

  get nextId() {
    return this.idCounter++
  }
}

export const LiveValueDebug = new _LiveValueDebug()
