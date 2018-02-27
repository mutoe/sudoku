
// 调试用全局变量
window.MT = {}

// 快捷方法 随机生成一个 0 - 8 的数
const rand = () => {
  return Math.floor(Math.random() * 9 )
}

// 数独类
class Sudoku {
  constructor() {
    // 初始化盘面
    this.initSudoku()
  }

  // 初始化盘面
  initSudoku() {
    // 数独胜利
    this.win = false
    // 数独无解
    this.invalid = null
    // 数独有唯一解
    this.uniqueAnswer = null
    // 盘面出错
    this.mistakes = false
    // 剩余空格数
    this.emptyCount = 81

    // 盘面
    this.grids = []
    for (let i = 0; i < 9; i++) {
      this.grids[i] = []
      for (let j = 0; j < 9; j++) {
        this.grids[i][j] = new Grid(i, j, null)
      }
    }

    return this
  }

  // 生成一个数独终盘
  generateSudokuIntact() {
    do {
      this.initSudoku()

      // 从数字 1 开始填，1 填完后开始填 2，以此类推
      for (let k = 1; k <= 9; k++) {
        // 从第一行开始填，以此类推
        for (let j = 0; j < 9; j++) {
          // 每一行从一个随机的位置（列）开始
          let seed = rand()
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
              this.emptyCount--
              break
            }
          }
        }
      }

      if (this.emptyCount > 0) {
        this.invalid = true
      } else {
        this.invalid = false
      }
    } while (this.invalid === true)

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

  // 格式化输出当前盘面
  print() {
    let data = []
    for (let i = 0; i < 9; i++) {
      data[i] = []
      for (let j = 0; j < 9; j++) {
        if (!this.grids[j][i].value) continue
        data[i][j] = this.grids[j][i].value
      }
    }
    return {
      win: this.win,
      invalid: this.invalid,
      mistakes: this.mistakes,
      data: data,
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
  }

}

// 设置游戏区域大小
const setGamearea = () => {
  let screenWidth = window.screen.width
  let screenHeight = window.screen.height

  // 获取并设置游戏区域宽高
  let gameareaWidth = screenWidth <= screenHeight ? screenWidth : screenHeight

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
  let ctx = setGamearea() // ctx 游戏区 canvas 上下文对象

  let startTime = new Date().getTime()

  let sudoku = new Sudoku()  // 实例化一个数独
  sudoku.generateSudokuIntact() // 生成一个终盘
  console.log(`终盘生成完毕，耗时 ${new Date().getTime() - startTime}ms`)

  startTime = new Date().getTime()
  refresh(ctx, sudoku)
  console.log(`数独生成完毕，耗时 ${new Date().getTime() - startTime}ms`)

  console.table(sudoku.print().data)

  window.MT.sudoku = sudoku
  // console.table(MT)
}

// 入口
$(document).ready(() => {
  initGame()
})
