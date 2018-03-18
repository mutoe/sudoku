
import Sudoku from './sudoku'
import $ from 'n-zepto'

class Game {
  constructor(wrap) {
    this.wrap = wrap
    this.screenWidth = undefined
    this.gridWidth = undefined
    this.ratio = 1.4 // canvas 放大倍率

    this.touch = { x: null, y: null }

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
        this.datCtx.fillStyle =
          Math.floor(i / 3) % 2 == Math.floor(j / 3) % 2 ? '#eee' : '#ddd'
        this.datCtx.fillRect(i * width, j * width, width, width)

        // 绘制数字
        if (this.sudoku.grids[i][j].value !== null) {
          this.datCtx.fillStyle = '#282828'
          this.datCtx.fillText(
            this.sudoku.grids[i][j].value,
            i * width + width / 2,
            j * width + width / 2,
            width
          )
        }
      }
    }
  }

  // 初始化游戏
  init(options) {
    console.time('total')

    this.setGamearea()

    this.sudoku = new Sudoku(options.shortcut) // 实例化一个数独

    // 生成一个终盘
    console.time('generate sudoku intact')
    this.seed = options.seed
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
    this.touch = { x, y }
    this.actCtx.beginPath()
    this.actCtx.arc(x, y, 10, 0, 2 * Math.PI, true)
    this.actCtx.fill()
    this.actCtx.closePath()
  }

  onTouchEnd() {
    console.log(this.touch)
    let x = Math.floor(this.touch.x / this.gridWidth)
    let y = Math.floor(this.touch.y / this.gridWidth)
    $('#debug').text(`x: ${x}, y: ${y}`)
  }
}

const Main = () => {
  // 入口
  $(document).ready(() => {
    let wrap = document.getElementById('gamearea')
    let game = new Game(wrap)
    game.init({
      shortcut: '', // 使用快捷方法生成数独
      seed: 2, // 随机生成一个数独并使用种子
      empty: 20 // 随机扣去空格数
    })
  })
}

export default Main
