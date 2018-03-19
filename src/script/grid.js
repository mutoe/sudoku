// 宫格类
class Grid {
  /**
   *
   * @param {Number} row 行坐标
   * @param {Number} col 列坐标
   * @param {Number} [value = null] 该列初始数值
   */
  constructor(row, col, value = null) {
    this.col = col
    this.row = row
    this.box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
    this.value = value // 值
    this.readonly = false // 只读
  }

  /**
   * 将该格置空
   */
  setEmpty() {
    if (this.readonly) return -1
    this.value = null
  }

  /**
   * 静态方法 获取当前坐标所在宫格 0-8
   * @param  {Number} row 目标格所在行
   * @param  {Number} col 目标格所在列
   * @return {Number}     返回所在宫格
   */
  static getBox(row, col) {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3) // 位于第几宫 (0-8)
  }
}

export default Grid
