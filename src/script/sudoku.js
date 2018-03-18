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
    /** @type {({col: Number, row: Number})[]} 剩余空格坐标 */
    this.emptyGrids = new Array(81)

    /** @type {Grid[][]} 游戏数据 */
    this.grids = new Array(9)
    for (let i = 0; i < 9; i++) {
      this.grids[i] = new Array(9)
    }
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        let value = 0
        if (shortcut) value = shortcut.shift()
        this.grids[i][j] = new Grid(i, j, value - 0 || null)
      }
    }

    return this
  }

  /**
   * 生成数独
   */
  generate() {
    do {
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
    } while (this.invalid)

    this.lock()

    return this
  }

  // 生成一个数独终盘
  generateIntact() {
    if (this.begin) return this
    do {
      this.initSudoku()

      // 从数字 1 开始填，1 填完后开始填 2，以此类推
      for (let k = 1; k <= 9; k++) {
        // 从第一行开始填，以此类推
        for (let j = 0; j < 9; j++) {
          // 每一行从一个随机的位置（列）开始
          let seed = this.rs.rand()
          for (let l = 0; l < 36; l++) {
            let i = (l + seed) % 9
            // 如果当前格子不为空 跳过本列
            if (this.grids[i][j].value !== null) continue

            // 本列允许填入标记
            let enableFill = true

            // 判断本列待填入数字是否冲突
            for (let m = 0; m < 9; m++) {
              if (this.grids[i][m].value == k) {
                enableFill = false
                break
              }
            }

            // 如果不能填就跳过本列
            if (!enableFill) continue

            // 判断当前宫待填入数字是否冲突
            let chunk = new Grid().getChunk(i, j) // 位于第几宫 (0-8)
            let startRow = Math.floor(chunk / 3) * 3
            let startCol = (chunk % 3) * 3
            for (let m = startCol; m < startCol + 3; m++) {
              for (let n = startRow; n < startRow + 3; n++) {
                if (this.grids[m][n].value == k) {
                  enableFill = false
                  break
                }
              }
            }

            // 如果不冲突就填入
            if (enableFill) {
              this.grids[i][j].value = k
              this.emptyGrids.pop()
              break
            }
          }
        }
      }

      // 如果填到最后还有空格 说明终盘生成失败
      if (this.emptyGrids.length > 0) {
        this.invalid = true
      } else {
        this.invalid = false
      }
    } while (this.invalid === true)
    return this
  }

  /**
   * 从完整数独中扣掉若干空格
   */
  subtractGrids() {
    // 如果游戏已经开始 则不能再扣取
    if (this.begin) return this
    if (this.emptyGrids.length > 0) throw Error('无法从残缺盘面执行该方法')
    for (let i = 0; i < this.options.empty; i++) {
      let row, col
      // 随机选格子 直到选中一个非空格
      do {
        row = this.rs.rand()
        col = this.rs.rand()
      } while (this.grids[col][row].value === null)

      // 挖去该格
      this.grids[col][row].value = null
    }

    return this
  }

  /**
   * 检查某格子剩余可填数字
   * @param {Number} col 列坐标
   * @param {Number} row 行坐标
   * @return {Number[]} 所有可填数字
   */
  checkGrid(col, row) {
    let existNums = []
    // 检查当前行
    for (let i = 0; i < 9; i++) {
      if (this.grids[i][row].value) {
        existNums.push(this.grids[row][i].value)
      }
    }
    // 检查当前列
    for (let j = 0; j < 9; j++) {
      if (this.grids[col][j].value) {
        existNums.push(this.grids[col][j].value)
      }
    }
    // 检查当前宫
    let chunk = new Grid().getChunk(col, row) // 位于第几宫 (0-8)
    let startRow = Math.floor(chunk / 3) * 3
    let startCol = (chunk % 3) * 3
    for (let i = startCol; i < startCol + 3; i++) {
      for (let j = startRow; j < startRow + 3; j++) {
        if (this.grids[i][j].value) {
          existNums.push(this.grids[i][j].value)
        }
      }
    }

    // 返回所有可填数字
    let result = [...new Set(existNums)]
    return result.sort()
  }

  /**
   * 根据数独生成密集表示法的 0,1 矩阵
   *
   * @return {number[][]}  0,1 矩阵
   */
  toSparse() {
    let sparse = []
    // 遍历数独的每格
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        let c = this.grids[x][y].chunk // 用索引 0-8 表示 1-9 宫
        if (this.grids[x][y].value) {
          // 如果读取到数字, 在矩阵中增加一行, 表示填写数字 n
          let row = []
          let n = this.grids[x][y].value - 1 // 用索引 0-8 表示数字 1-9
          row.push(0 * 81 + y * 9 + x) // 第 y 行第 x 列有数字
          row.push(1 * 81 + x * 9 + n) // 第 x 列填 n
          row.push(2 * 81 + y * 9 + n) // 第 y 行填 n
          row.push(3 * 81 + c * 9 + n) // 第 c 宫填 n
          sparse.push(row)
        } else {
          // 如果没有读取到空格, 则增加 9 行, 表示 1-9 都试一试
          for (let n = 0; n < 9; n++) {
            let row = []
            row.push(0 * 81 + y * 9 + x)
            row.push(1 * 81 + x * 9 + n)
            row.push(2 * 81 + y * 9 + n)
            row.push(3 * 81 + c * 9 + n)
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
   * 锁定当前棋盘 准备开始游戏
   */
  lock() {
    if (this.begin) throw new Error('已经开始的游戏无法锁定棋盘')
    this.emptyGrids = []
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        let grid = this.grids[i][j]
        if (grid.value) {
          grid.readonly = true
        } else {
          grid.readonly = false
          this.emptyGrids.push({ col: i, row: j })
        }
      }
    }
    this.resolved = false
    this.begin = true
  }

  // 格式化输出当前盘面
  print() {
    let data = []
    let shortcut = ''
    for (let i = 0; i < 9; i++) {
      data[i] = []
      for (let j = 0; j < 9; j++) {
        if (!this.grids[j][i].value) {
          shortcut += '.'
        } else {
          shortcut += this.grids[j][i].value.toString()
          data[i][j] = this.grids[j][i].value
        }
      }
    }
    return {
      options: this.options,
      resolved: this.resolved,
      invalid: this.invalid,
      mistakes: this.mistakes,
      shortcut,
      data,
    }
  }
}

export default Sudoku
