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
    this.ratio = Math.PI / 2

    // 触摸坐标
    this.touch = { x: null, y: null, row: null, col: null, start: 0, end: 0 }
    // 是否正在交互
    this.inAction = false

    // 交互监听
    this.wrap.addEventListener('touchmove', this.onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchstart', this.onTouchMove.bind(this), false)
    this.wrap.addEventListener('touchend', this.onTouchEnd.bind(this), false)
  }

  onTouchMove(event) {
    event.preventDefault()
    this.touch.start = new Date().getTime()
    let touch = event.touches[0]
    let x = touch.pageX * this.ratio
    let y = (touch.pageY - this.wrap.offsetTop) * this.ratio
    this.touch.x = x
    this.touch.y = y
  }

  onTouchEnd() {
    this.touch.end = new Date().getTime()

    // 如果可交互
    if (this.handleTouch()) {
      $(this.actLayer).toggleClass('active')
      this.inAction = !this.inAction
    }
  }

  handleTouch() {
    if (!this.inAction) {
      let row = Math.floor(this.touch.y / this.gridWidth)
      let col = Math.floor(this.touch.x / this.gridWidth)
      this.touch.row = row
      this.touch.col = col

      console.log(this.sudoku.grids[row][col].readonly)

      // 如果该格为只读属性 中断操作
      if (this.sudoku.grids[row][col].readonly) {
        return false
      }

      // 长按将某格清空
      if (this.touch.end > this.touch.start + 650) {
        this.sudoku.grids[row][col].setEmpty()
        console.log(`set grid[${row}][${col}] empty`)
        
        // refresh
        this.drawDataLayer()
        return false
      }

      this.drawActionLayer(this.touch)
      $('#debug').text(`r: ${row}, c: ${col}`)
    } else {
      // 获取当前点击位置相对于弹出窗口左上角的位置
      let offsetX = this.touch.x - this.touch.offset.x
      let offsetY = this.touch.y - this.touch.offset.y

      // 点击弹出层以外的地方中断交互
      let isOutsize =
        offsetX < 0 ||
        offsetX > 3 * this.gridWidth ||
        offsetY < 0 ||
        offsetY > 3 * this.gridWidth
      if (isOutsize) return true

      let col = Math.floor(offsetX / this.gridWidth)
      let row = Math.floor(offsetY / this.gridWidth)
      let value = row * 3 + col + 1

      this.sudoku.grids[this.touch.row][this.touch.col].value = value

      // refresh
      this.drawDataLayer()
    }

    console.log(this.touch)

    return true
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
    this.datCtx.save()

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.datCtx.restore()

        // 绘制边线
        this.datCtx.strokeRect(c * width, r * width, width, width)

        // 填充色
        this.datCtx.fillStyle =
          Math.floor(r / 3) % 2 == Math.floor(c / 3) % 2 ? '#eee' : '#ddd'
        this.datCtx.fillRect(c * width, r * width, width, width)

        // 获取当前格
        let grid = this.sudoku.grids[r][c]

        // 如果当前格没有填 跳过绘制
        if (grid.value === null) continue

        // 区分只读格和用户可填格
        if (grid.readonly) {
          this.datCtx.fillStyle = '#888'
        } else {
          this.datCtx.font = `san-serif bold ${fontSize + 12}px`
          this.datCtx.fillStyle = '#282828'
        }

        // 绘制数字
        this.datCtx.fillText(
          grid.value,
          c * width + width / 2,
          r * width + width / 2,
          width
        )
      }
    }
  }

  /**
   * 绘制交互层
   * @param {Object|undefined} location {x: Number, y: Number} 触摸位置
   */
  drawActionLayer(location) {
    // 清空画布
    this.actLayer.height = this.actLayer.height

    if (location === undefined) return

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

    // 记录交互窗口左上角位置
    this.touch.offset = {
      x: location.x,
      y: location.y
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        // 绘制边线
        this.actCtx.strokeRect(
          location.x + c * width,
          location.y + r * width,
          width,
          width
        )

        // 填充色
        this.actCtx.fillStyle = c % 2 == r % 2 ? '#eee' : '#ddd'
        this.actCtx.fillRect(
          location.x + c * width,
          location.y + r * width,
          width,
          width
        )

        // 绘制数字
        this.actCtx.fillStyle = '#282828'
        this.actCtx.fillText(
          r * 3 + c + 1,
          location.x + c * width + width / 2,
          location.y + r * width + width / 2,
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
      seed: 2, // 随机生成一个数独并使用种子
      empty: 20 // 随机扣去空格数
    })

    // 游戏区大小随动
    $(window).on('resize', () => {
      game.setGamearea()
      game.drawDataLayer()
    })
  })
}

export default Main
