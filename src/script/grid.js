// 宫格类
class Grid {
  /**
   *
   * @param {Number} col 列坐标
   * @param {Number} row 行坐标
   * @param {Number} [value = null] 该列初始数值
   */
  constructor(col, row, value = null) {
    this.col = col
    this.row = row
    this.chunk = this.getChunk(col, row)
    this.value = value // 值
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
    return Math.floor(row / 3) * 3 + Math.floor(col / 3) // 位于第几宫 (0-8)
  }
}

export default Grid
