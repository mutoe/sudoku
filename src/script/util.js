
/**
 * 随机数种子
 * @param {Number} seed 种子
 */
let random = (seed) => {
  if (typeof seed !== 'number') throw new TypeError('seed must be a Number')
  else {
    seed = Math.sin(seed) * 10000
    return seed - Math.floor(seed)
  }
}

// 快捷方法 随机生成一个 0 - 8 的数
let rand = (seed) => {
  if (!seed) seed = Math.random()
  seed = random(seed)
  return Math.floor(random(seed) * 9)
}

export default {
  random,
  rand,
}
