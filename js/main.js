/* global LinkedMatrix, DLX, MT */

// 调试用全局变量
window.MT = {
  // 随机数种子
  random(seed) {
    if (typeof seed !== 'number') return Math.random()
    else {
      seed = Math.sin(seed) * 10000
      return seed - Math.floor(seed)
    }
  },
  // 快捷方法 随机生成一个 0 - 8 的数
  rand() {
    if (!MT.seed) MT.seed = Math.random()
    MT.seed = MT.random(MT.seed)
    return Math.floor(MT.random(MT.seed) * 9 )
  },
}

// 数独类
class Sudoku {
  constructor(shortcut) {
    // 初始化盘面
    this.initSudoku(shortcut)
  }

  // 初始化盘面
  initSudoku(shortcut) {
    if (shortcut) shortcut = shortcut.split('')

    // 数独胜利
    this.resolved = false
    // 可以开始解题
    this.begin = !!shortcut
    // 数独无解
    this.invalid = null
    // 数独有唯一解
    this.uniqueAnswer = null
    // 盘面出错
    this.mistakes = false
    // 空格坐标 Array<{col: Number, row: Number}>
    this.emptyGrids = new Array(81)

    // 盘面
    this.grids = new Array(9)
    for (let i = 0; i < 9; i++) {
      this.grids[i] = new Array(9)
    }
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        let value = 0
        if (shortcut && shortcut.length) value = shortcut.shift()
        this.grids[i][j] = new Grid(i, j, value - 0 || null)
      }
    }

    return this
  }

  // 生成一个数独终盘
  generateSudokuIntact() {
    if (this.begin) return this
    do {
      this.initSudoku()

      // 从数字 1 开始填，1 填完后开始填 2，以此类推
      for (let k = 1; k <= 9; k++) {
        // 从第一行开始填，以此类推
        for (let j = 0; j < 9; j++) {
          // 每一行从一个随机的位置（列）开始
          let seed = MT.rand()
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
            let chunk = Math.floor(j / 3) * 3 + Math.floor(i / 3)  // 位于第几宫 (0-8)
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

      if (this.emptyGrids.length > 0) {
        this.invalid = true
      } else {
        this.invalid = false
      }
    } while (this.invalid === true)

    return this
  }

  // 从完整数独中扣掉若干空格
  subtractGrids(count = 36) {
    if (this.begin) return this
    if (this.emptyGrids.length > 0) throw Error('无法从残缺盘面执行该方法')
    for (let i = 0; i < count; i++) {
      let row, col
      do {
        row = MT.rand()
        col = MT.rand()
      } while (this.grids[col][row].value === null)
      this.grids[col][row].value = null
    }

    return this
  }

  // 检查某格子剩余可填数字
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
    let chunk = Math.floor(row / 3) * 3 + Math.floor(col / 3)  // 位于第几宫 (0-8)
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
   * 求解数独
   * 将数独问题转化为求解精确覆盖的问题 从而使用 DLX 算法进行高效求解
   */
  solve() {
    let sparse = to_sparse(this)
    let lm = new LinkedMatrix().from_sparse(sparse)
    let result = DLX.solve_linked_matrix(lm)
    MT.linkedMatrix = lm

    /**
     * 根据数独生成密集表示法的 0,1 矩阵
     *
     * 遍历数独的每格, 如果读取到数字, 在矩阵中增加一行, 表示填写数字 n
     * 如果没有读取到空格, 则增加 9 行, 表示 1-9 都试一试
     * 每行有 81 * 4 列, 第一个 81 列表示第 y 行第 x 列有数字
     * 第二个 81 列表示第 x 列填 n, 第三个 81 列表示第 y 行填 n
     * 最后 81 列表示第 c 宫填 n
     *
     * @return {number[][]}  0,1 矩阵
     */
    function to_sparse(sudoku) {
      let sparse = []
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          let c = sudoku.grids[x][y].chunk
          if (sudoku.grids[x][y].value) {
            let row = []
            let n = sudoku.grids[x][y].value - 1
            row.push(0 * 81 + y * 9 + x)
            row.push(1 * 81 + x * 9 + n)
            row.push(2 * 81 + y * 9 + n)
            row.push(3 * 81 + c * 9 + n)
            sparse.push(row)
          } else {
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
      resolved: this.resolved,
      invalid: this.invalid,
      mistakes: this.mistakes,
      shortcut,
      data,
    }

  }

}

// 宫格类
class Grid {
  constructor(col, row, value) {
    this.col = col
    this.row = row
    this.chunk = Math.floor(row / 3) * 3 + Math.floor(col / 3)  // 位于第几宫 (0-8)
    this.value = value  // 值
    this.readonly = false // 只读
    this.removable = true // 允许移除
  }

}

// 设置游戏区域大小
const setGamearea = () => {
  let screenWidth = window.screen.width
  let screenHeight = window.screen.height

  // 获取并设置游戏区域宽高
  let gameareaWidth = screenWidth <= screenHeight ? screenWidth : screenHeight

  if (gameareaWidth > 640) gameareaWidth = 640

  const canvas = document.getElementById('gamearea')
  const ctx = canvas.getContext('2d')

  canvas.width = gameareaWidth
  canvas.height = gameareaWidth

  window.MT.screenWidth = gameareaWidth
  window.MT.gridWidth = Math.floor(gameareaWidth / 9)

  return ctx
}

// 刷新画面
const refresh = (ctx, sudoku) => {

  const width = window.MT.gridWidth
  const fontSize = window.MT.gridWidth / 2
  ctx.font = `${fontSize}px san-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      // 绘制边线
      ctx.strokeRect(i * width, j * width, width, width)

      // 填充色
      ctx.fillStyle = Math.floor(i / 3) % 2  == Math.floor(j / 3) % 2 ? '#eee' : '#ddd'
      ctx.fillRect(i * width, j * width, width, width)

      // 绘制数字
      if (sudoku.grids[i][j].value !== null) {
        ctx.fillStyle = '#282828'
        ctx.fillText(sudoku.grids[i][j].value, i * width + (width / 2), j * width + (width / 2), width)
      }
    }
  }
}

// 初始化游戏
const initGame = () => {
  console.time('total')

  let ctx = setGamearea() // 游戏区 canvas 上下文对象

  const shortcut = '356.7.9414815.9273279314568647182.959.263578453849.126793.4.65286572341.124.56837'
  let sudoku = new Sudoku(shortcut)  // 实例化一个数独

  // 生成一个终盘
  console.time('generate sudoku intact')
  MT.seed = 1 // 使用种子生成一个终盘
  sudoku.generateSudokuIntact()
  console.timeEnd('generate sudoku intact')

  refresh(ctx, sudoku)

  // 随机扣掉 20 个数字
  console.time('subtract grids')
  sudoku.subtractGrids(10)
  console.timeEnd('subtract grids')

  refresh(ctx, sudoku)

  console.timeEnd('total')

  refresh(ctx, sudoku)

  console.table(sudoku.print())
  window.MT.sudoku = sudoku

}

// 入口
$(document).ready(() => {
  initGame()
})
