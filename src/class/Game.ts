import Grid from './Grid'

export interface GameOptions {
  /**
   * shortcut for quick start the game
   *
   * @description There are 81 digits from left to right. If `.` or `0` appears, skip the grid.
   */
  shortcut: string
}

export default class Game {
  public grids: Grid[][] = []
  public shortcut: string = '.'.repeat(81)

  constructor (options: Partial<GameOptions> = {}) {
    if (options.shortcut) {
      this.shortcut = options.shortcut
    }
    this.initGrids()
  }

  initGrids (): void {
    this.grids = new Array(9).fill(null)
    this.grids.forEach((_, i) => (this.grids[i] = new Array(9).fill(null)))

    const subject = this.shortcut.split('')
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const value = Number(subject.shift()) || 0
        this.grids[i][j] = new Grid(i, j, value)
      }
    }
  }
}
