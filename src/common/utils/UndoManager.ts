
export interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

class UndoManager {

  index: number = 0

  state: State<any> = {
    past: [],
    present: {},
    future: []
  }

  constructor() {
    this.index = 0
  }
}

export default UndoManager