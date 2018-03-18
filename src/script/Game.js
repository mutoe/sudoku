import Sudoku from './Sudoku'
import $ from 'n-zepto'

class Game {
  constructor(wrap) {
    this.wrap = wrap
    // 游戏区宽度
    this.screenWidth = undefined
    // 小格宽度
    this.gridWidth = undefined
    // canvas 放大倍率 用于提高分辨率
    this.ratio = 1.4

    // 触摸坐标
    this.touch = { x: null, y: null, row: null, col: null, start: 0, end: 0 }
    // 是否正在交互
    this.inAction = false

    // 交互监听
    this.wrap.addEventListener('touchmove', onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchstart', onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchend', onTouchEnd.bind(this), false)

    function onTouchMove(event) {
      this.touch.start = new Date().getTime()
      this.actCtx.clearRect(0, 0, this.actLayer.height, this.actLayer.height)
      let touch = event.touches[0]
      let x = touch.pageX * this.ratio
      let y = (touch.pageY - this.wrap.offsetTop) * this.ratio
      this.touch.x = x
      this.touch.y = y

      // 测试用标点
      this.actCtx.beginPath()
      this.actCtx.arc(x, y, 10, 0, 2 * Math.PI, true)
      this.actCtx.fill()
      this.actCtx.closePath()
    }

    function onTouchEnd() {
      this.touch.end = new Date().getTime()
      console.log(this.touch)

      if (!this.inAction) {
        let col = Math.floor(this.touch.x / this.gridWidth)
        let row = Math.floor(this.touch.y / this.gridWidth)
        this.touch.col = col
        this.touch.row = row

        // 长按将某格清空
        if (this.touch.end > this.touch.start + 650) {
          this.sudoku.grids[col][row].setEmpty()
          return
        }

        this.drawActionLayer(this.touch)
        $('#debug').text(`x: ${col}, y: ${row}`)
      } else {
        // something
      }
      
      $(this.actLayer).toggleClass('active')
      this.inAction = !this.inAction
    }
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
  drawDataLayer(sudoku) {
    if (!sudoku) sudoku = this.sudoku
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
          this.datCtx.fillStyle = '#666'
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

  /**
   * 绘制交互层
   * @param {Object|undefined} location {x: Number, y: Number} 触摸位置
   */
  drawActionLayer(location) {
    // 如果没有传参则清空画布
    if (location === undefined) {
      this.actLayer.height = this.actLayer.height
      return
    }

    const width = this.gridWidth
    const fontSize = Math.floor(this.gridWidth / 2)
    this.actCtx.font = `${fontSize}px san-serif`
    this.actCtx.textAlign = 'center'
    this.actCtx.textBaseline = 'middle'

    // 交互区超出游戏区位置修正
    if (location.x > 6 * width) {
      location.x -= 3 * width
    }
    if (location.y > 6 * width) {
      location.y -= 3 * width
    }

    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        // 绘制边线
        this.actCtx.strokeRect(
          location.x + i * width,
          location.y + j * width,
          width,
          width
        )

        // 填充色
        this.actCtx.fillStyle = i % 2 == j % 2 ? '#eee' : '#ddd'
        this.actCtx.fillRect(
          location.x + i * width,
          location.y + j * width,
          width,
          width
        )

        // 绘制数字
        this.actCtx.fillStyle = '#282828'
        this.actCtx.fillText(
          j * 3 + i + 1,
          location.x + i * width + width / 2,
          location.y + j * width + width / 2,
          width
        )
      }
    }
  }

  // 初始化游戏
  init(options) {
    console.time('total')

    this.setGamearea()

    this.sudoku = new Sudoku(options) // 实例化一个数独

    console.timeEnd('total')

    this.drawDataLayer()

    console.log(this.sudoku.print())

    return this
  }
}

const Main = () => {
  // 入口
  $(document).ready(() => {
    let wrap = document.getElementById('gamearea')
    let game = new Game(wrap)
    game.init({
      shortcut: '', // 使用快捷方法生成数独
      seed: 2,      // 随机生成一个数独并使用种子
      empty: 20,    // 随机扣去空格数
    })

    // 游戏区大小随动
    $(window).on('resize', () => {
      game.setGamearea()
      game.drawDataLayer()
    })
  })
}

export default Main
