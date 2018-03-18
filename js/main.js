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
    if (shortcut) {
      if (shortcut.length !== 81) throw new RangeError('快捷方式不是一个有效的字符串')
      shortcut = shortcut.split('')
    } else {
      shortcut = undefined
    }

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
        if (shortcut) value = shortcut.shift()
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
            let chunk = new Grid().getChunk(i, j)  // 位于第几宫 (0-8)
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
   * @param  {number} [count=36] 需要挖去的格子数
   */
  subtractGrids(count = 36) {
    // 如果游戏已经开始 则不能再扣取
    if (this.begin) return this
    if (this.emptyGrids.length > 0) throw Error('无法从残缺盘面执行该方法')
    for (let i = 0; i < count; i++) {
      let row, col
      // 随机选格子 直到选中一个非空格
      do {
        row = MT.rand()
        col = MT.rand()
      } while (this.grids[col][row].value === null)

      // 挖去该格
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
    let chunk = new Grid().getChunk(col, row)  // 位于第几宫 (0-8)
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
          row.push(0 * 81 + y * 9 + x)  // 第 y 行第 x 列有数字
          row.push(1 * 81 + x * 9 + n)  // 第 x 列填 n
          row.push(2 * 81 + y * 9 + n)  // 第 y 行填 n
          row.push(3 * 81 + c * 9 + n)  // 第 c 宫填 n
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
  solve() {
    let sparse = this.toSparse()
    let lm = new LinkedMatrix().from_sparse(sparse)
    let result = DLX.solve_linked_matrix(lm)
    if (result.length === 1) {
      this.resolved = true
      this.uniqueAnswer = true
      console.log('Resolved.')
    } else if (result.length > 1) {
      this.resoved = false
      this.uniqueAnswer = false
      console.log('Resolved. But not unique answer.')
    } else {
      this.resolved = false
      this.invalid = true
      console.log('This is invalid sudoku.')
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
    this.chunk = this.getChunk(col, row)
    this.value = value  // 值
    this.readonly = false // 只读
    this.removable = true // 允许移除
  }

  /**
   * 获取当前坐标所在宫格 0-8
   * @param  {number} col 目标格所在列
   * @param  {number} row 目标格所在行
   * @return {number}     返回所在宫格
   */
  getChunk(col, row) {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3)  // 位于第几宫 (0-8)
  }

}

class Game {
  constructor(wrap) {
    this.wrap = wrap
    MT.wrap = wrap
    this.screenWidth = undefined
    this.gridWidth = undefined
    this.ratio = 1.4  // canvas 放大倍率

    this.touch = {x: null, y: null}

    this.wrap.addEventListener('touchmove', this.onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchstart', this.onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchend', this.onTouchEnd.bind(this), false)
  }


  // 设置游戏区域大小
  setGamearea() {
    let screenWidth = document.body.clientWidth
    let screenHeight = document.body.clientHeight

    // 获取并设置游戏区域宽高
    let gameareaWidth = screenWidth <= screenHeight ? screenWidth : screenHeight
    if (gameareaWidth > 640) gameareaWidth = 640

    this.wrap.style.width = this.wrap.style.height = gameareaWidth + 'px'

    gameareaWidth *= this.ratio // canvas 边框修正

    // 数据层
    this.datLayer = this.wrap.getElementsByClassName('dat-layer')[0]
    this.datLayer.width = this.datLayer.height = gameareaWidth
    this.datCtx = this.datLayer.getContext('2d')

    // 交互层
    this.actLayer = this.wrap.getElementsByClassName('act-layer')[0]
    this.actLayer.width = this.actLayer.height = gameareaWidth
    this.actCtx = this.actLayer.getContext('2d')

    this.screenWidth = gameareaWidth
    this.gridWidth = gameareaWidth / 9

    return this
  }

  /**
   * 绘制数据层
   */
  drawDataLayer() {
    const width = this.gridWidth
    const fontSize = Math.floor(this.gridWidth / 2)
    this.datCtx.font = `${fontSize}px san-serif`
    this.datCtx.textAlign = 'center'
    this.datCtx.textBaseline = 'middle'

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // 绘制边线
        this.datCtx.strokeRect(i * width, j * width, width, width)

        // 填充色
        this.datCtx.fillStyle = Math.floor(i / 3) % 2  == Math.floor(j / 3) % 2 ? '#eee' : '#ddd'
        this.datCtx.fillRect(i * width, j * width, width, width)

        // 绘制数字
        if (this.sudoku.grids[i][j].value !== null) {
          this.datCtx.fillStyle = '#282828'
          this.datCtx.fillText(this.sudoku.grids[i][j].value, i * width + (width / 2), j * width + (width / 2), width)
        }
      }
    }
  }

  // 初始化游戏
  init(options) {
    console.time('total')

    this.setGamearea()

    this.sudoku = new Sudoku(options.shortcut)  // 实例化一个数独

    // 生成一个终盘
    console.time('generate sudoku intact')
    this.seed = MT.seed = options.seed
    this.sudoku.generateSudokuIntact()
    console.timeEnd('generate sudoku intact')

    this.drawDataLayer()

    // 随机扣掉数字
    console.time('subtract grids')
    this.sudoku.subtractGrids(options.empty)
    console.timeEnd('subtract grids')

    this.drawDataLayer()

    console.time('solve sudoku')
    this.sudoku.solve()
    console.timeEnd('solve sudoku')

    console.timeEnd('total')

    console.table(this.sudoku.print())

    return this
  }

  onTouchMove(event) {
    this.actCtx.clearRect(0, 0, this.actLayer.height, this.actLayer.height)
    let touch = event.touches[0]
    let x = touch.pageX * this.ratio
    let y = (touch.pageY - this.wrap.offsetTop) * this.ratio
    this.touch = {x, y}
    this.actCtx.beginPath()
    this.actCtx.arc(x, y, 10, 0, 2 * Math.PI, true)
    this.actCtx.fill()
    this.actCtx.closePath()
    // console.log(touch)
  }

  onTouchEnd() {
    console.log(this.touch)
    let x = Math.floor(this.touch.x / this.gridWidth)
    let y = Math.floor(this.touch.y / this.gridWidth)
    $('#debug').text(`x: ${x}, y: ${y}`)
  }

}

// 入口
$(document).ready(() => {
  let wrap = document.getElementById('gamearea')
  let game = new Game(wrap)
  game.init({
    shortcut: '',   // 使用快捷方法生成数独
    seed: 2,        // 随机生成一个数独并使用种子
    empty: 20,      // 随机扣去空格数
  })
})
