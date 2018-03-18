/**
 * 种子随机数
 * @class
 */
class RandomSeed {
  /**
   * @constructor
   * @param {Number} seed 种子
   */
  constructor(seed) {
    if (!seed || typeof seed !== 'number') seed = Math.random()
    this.seed = seed
  }

  /**
   * 随机数种子
   * @param {Number} seed 种子
   * @return {Number} 0-1 的浮点数
   */
  random(seed) {
    if (typeof seed !== 'number') throw new TypeError('seed must be a Number')

    seed = Math.sin(seed) * 10000
    return seed - Math.floor(seed)
  }

  /**
   * 随机生成一个 0-8 的数
   * 如果初始种子保持不变, 则每次调用该方法生成的随机数顺序是一致的
   * @return {Number} 0-8 的整数
   */
  rand() {
    // 种子伪递归 (用于下一次随机)
    this.seed = this.random(this.seed)

    // 返回随机数
    return Math.floor(this.random(this.seed) * 9)
  }
}

export default RandomSeed
