export default class Grid {
  public row: number
  public col: number
  public value: number

  constructor (row: number, col: number, value = 0) {
    this.row = row
    this.col = col
    this.value = value
  }

  /**
   * get chunk number in Sudoku (0-8)
   */
  get chunk (): number {
    return ~~(this.row / 3) * 3 + ~~(this.col / 3)
  }

  toString (): string {
    return `${this.row},${this.col}:${this.value}`
  }
}
