import Grid from './Grid'
import DLX from './DLX'
import RandomSeed from './RandomSeed'

/**
 * 数独类
 * @class
 * @member {Boolean} [resolved = false] 数独已完成
 * @member {Boolean} [begin = false]    已经开始游戏
 * @member {Boolean} [invalid = null]   数独无解
 * @member {Boolean} [uniqueAnswer = null] 数独有唯一解
 * @member {Boolean} [mistakes = false] 盘面出错
 * @member {({col: Number, row: Number})[]} emptyGrids 剩余空格坐标
 */
class Sudoku {
  /**
   * @constructor
   * @param {({seed: Number, empty: Number, shortcut: String})} options
   */
  constructor(options) {
    this.options = options
    // 初始化种子
    this.rs = new RandomSeed(this.options.seed)

    // 初始化盘面
    this.initSudoku(this.options.shortcut)

    // 生成数独
    this.generate()

    return this
  }

  /**
   * 初始化盘面
   * @param {?String} shortcut
   * 类似于 '2.314.2...12.' (shortcut.length = 81)
   */
  initSudoku(shortcut) {
    if (shortcut) {
      if (shortcut.length !== 81)
        throw new RangeError('快捷方式不是一个有效的字符串')
      shortcut = shortcut.split('')
    } else {
      shortcut = undefined
    }

    // 数独已完成
    this.resolved = false
    // 可以开始解题
    this.begin = !!shortcut
    // 数独无解
    this.invalid = null
    // 数独有唯一解
    this.uniqueAnswer = null
    // 盘面出错
    this.mistakes = false
    /** @type {({col: Number, row: Number, answer: Number})[]} 剩余空格坐标 */
    this.emptyGrids = new Array(81)

    /** @type {Grid[][]} 游戏数据 */
    this.grids = Array.from({ length: 9 }, () => new Array(9))
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let value = 0
        if (shortcut) value = Number(shortcut.shift())
        this.grids[r][c] = new Grid(r, c, value || null)
      }
    }

    return this
  }

  /**
   * 生成数独
   */
  generate() {
    let timer = 0
    do {
      timer++
      // 生成一个终盘
      console.time('generate sudoku intact')
      this.generateIntact()
      console.timeEnd('generate sudoku intact')

      // 随机扣掉数字
      console.time('subtract grids')
      this.subtractGrids(this.options.empty)
      console.timeEnd('subtract grids')

      console.time('try solve sudoku')
      this.try()
      console.timeEnd('try solve sudoku')

      console.warn('generate')
    } while (this.invalid && timer < 100)

    this.lock()

    return this
  }

  // 生成一个数独终盘
  generateIntact() {
    if (this.begin) return this
    let timer = 0
    do {
      timer++
      this.initSudoku()

      // 从数字 1 开始填，1 填完后开始填 2，以此类推
      for (let v = 1; v <= 9; v++) {
        // 从第一行开始填，以此类推
        for (let r = 0; r < 9; r++) {
          // 每一行从一个随机的位置（列）开始
          let seed = this.rs.rand()
          for (let l = 0; l < 36; l += 4) {
            let c = (l + seed) % 9
            // 如果当前格存在数字 跳过本列
            if (this.grids[r][c].value !== null) continue

            // 如果当前列 c 存在数字 v 跳过本列
            if (this.existInCol(c, v)) continue

            // 如果当前宫 b 存在数字 v 跳过本列
            let b = Grid.getBox(r, c) // 获取当前格所在宫索引
            if (this.existInBox(b, v)) continue

            // 无冲突 可以将数字 v 填入当前宫
            this.grids[r][c].value = v

            // 将剩余空格数自减
            this.emptyGrids.pop()

            // 跳出列循环 进入下一行
            break
          }
        }
      }

      // 如果填到最后还有空格 说明终盘生成失败
      if (this.emptyGrids.length > 0) {
        this.invalid = true
      } else {
        this.invalid = false
      }
      console.warn('generateIntact')
    } while (this.invalid === true && timer < 1000)
    return this
  }

  /**
   * 从完整数独中扣掉若干空格
   */
  subtractGrids() {
    // 如果游戏已经开始 则不能再扣取
    if (this.begin) return this

    // 重置空格数组
    this.emptyGrids = []

    for (let i = this.options.empty; i > 0; i--) {
      let r, c
      // 随机选格子 直到选中一个非空格
      let timer = 0
      do {
        timer++
        r = this.rs.rand()
        c = this.rs.rand()
        console.warn('subtractGrids')
      } while (this.grids[r][c].value === null && timer < 1000)

      this.emptyGrids.push({
        row: r,
        col: c,
        answer: this.grids[r][c].value
      })

      // 挖去该格
      this.grids[r][c].readonly = false
      this.grids[r][c].value = null
    }

    return this
  }

  /**
   * 根据数独生成密集表示法的 0,1 矩阵
   *
   * @return {number[][]}  0,1 矩阵
   */
  toSparse() {
    let sparse = []
    // 遍历数独的每格
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let b = this.grids[r][c].box // 用索引 0-8 表示 1-9 宫
        if (this.grids[r][c].value) {
          // 如果读取到数字, 在矩阵中增加一行, 表示填写数字 v
          let row = []
          let v = this.grids[r][c].value - 1 // 用索引 0-8 表示数字 1-9
          row.push(0 * 81 + r * 9 + c) // 第 r 行第 c 列有数字
          row.push(1 * 81 + c * 9 + v) // 第 c 列填 v
          row.push(2 * 81 + r * 9 + v) // 第 r 行填 v
          row.push(3 * 81 + b * 9 + v) // 第 b 宫填 v
          sparse.push(row)
        } else {
          // 如果没有读取到空格, 则增加 9 行, 表示 1-9 都试一试
          for (let v = 0; v < 9; v++) {
            let row = []
            row.push(0 * 81 + r * 9 + c)
            row.push(1 * 81 + c * 9 + v)
            row.push(2 * 81 + r * 9 + v)
            row.push(3 * 81 + b * 9 + v)
            sparse.push(row)
          }
        }
      }
    }
    return sparse
  }

  /**
   * 求解数独
   * 将数独问题转化为求解精确覆盖的问题 从而使用 DLX 算法进行高效求解
   */
  try() {
    let sparse = this.toSparse()
    let lm = new DLX.LinkedMatrix().from_sparse(sparse)
    let result = DLX.solve_linked_matrix(lm)
    if (result.length === 1) {
      this.invalid = false
      this.uniqueAnswer = true
      console.log('Resolved.')
      const final = this.transformResultToSudoku(sparse, result[0])
      let string = ''
      final.forEach(r => {
        r.forEach(c => {
          string += `${c+1} `
        })
        string += '\n'
      })
      console.log(string);
    } else if (result.length > 1) {
      this.invalid = true
      this.uniqueAnswer = false
      console.log('Resolved. But not unique answer.')
    } else {
      this.invalid = true
      this.resolved = false
      console.log('This is invalid sudoku.')
    }

    return this
  }

  /**
   * 根据稀疏矩阵和结果行推导出数独结果
   * @param {Number[][]} sparse
   * @param {Number[]} result
   */
  transformResultToSudoku(sparse, result) {
    const sudoku = new Array(9).fill()
    sudoku.forEach((v, i) => {
      sudoku[i] = []
    })
    for (const rowNumber of result) {
      const row = sparse[rowNumber]
      const r = ~~(row[0] / 9)
      const c = row[0] % 9
      const v = row[1] % 9
      sudoku[r][c] = v
    }
    return sudoku
  }

  /**
   * 锁定当前棋盘 准备开始游戏
   */
  lock() {
    if (this.begin) {
      console.log('已经开始的游戏无法锁定棋盘')
      return
    }
    this.resolved = false
    this.begin = true
  }

  /**
   * 检查数字 value 是否存在与某列 col 中
   * @param {Number} col 列索引
   * @param {Number} value 待填入数字
   * @return {Boolean}
   */
  existInCol(col, value) {
    for (let r = 0; r < 9; r++) {
      if (this.grids[r][col].value === value) return true
    }
    return false
  }

  /**
   * 检查数字 value 是否存在与某行 row 中
   * @param {Number} row 行索引
   * @param {Number} value 待填入数字
   * @return {Boolean}
   */
  existInRow(row, value) {
    for (let c = 0; c < 9; c++) {
      if (this.grids[row][c].value === value) return true
    }
    return true
  }

  /**
   * 检查数字 value 是否存在与某宫 box 中
   * @param {Number} box 宫索引
   * @param {Number} value 待填入数字
   * @return {Boolean}
   */
  existInBox(box, value) {
    const startRow = Math.floor(box / 3) * 3
    const startCol = (box % 3) * 3
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (this.grids[r][c].value === value) return true
      }
    }
    return false
  }

  // 格式化输出当前盘面
  print() {
    let data = []
    let shortcut = ''
    for (let r = 0; r < 9; r++) {
      data[r] = []
      for (let c = 0; c < 9; c++) {
        if (!this.grids[r][c].value) {
          shortcut += '.'
        } else {
          shortcut += this.grids[r][c].value.toString()
          data[r][c] = this.grids[r][c].value
        }
      }
    }
    return {
      options: this.options,
      resolved: this.resolved,
      invalid: this.invalid,
      mistakes: this.mistakes,
      grids: this.grids,
      shortcut,
      data
    }
  }
}

export default Sudoku
