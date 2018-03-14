
// 十字链表节点
class Node {
  /**
   * @constructor
   * @param {number} x 节点的 x 坐标
   * @param {number} y 节点的 y 坐标
   */
  constructor(x, y) {
    // 节点的 x y 坐标
    this.x = x
    this.y = y

    // 列节点数
    this.size = 0

    // 十字链
    this.l = this
    this.r = this
    this.u = this
    this.d = this
  }

  // 左右方向隐藏节点
  hide_lr() {
    this.l.r = this.r
    this.r.l = this.l
  }

  // 上下方向隐藏节点
  hide_ud() {
    this.u.d = this.d
    this.d.u = this.u
  }

  // 左右方向复原节点
  show_lr() {
    this.r.l = this
    this.l.r = this
  }

  // 上下方向复原节点
  show_ud() {
    this.u.d = this
    this.d.u = this
  }

  // 向左增加一个节点
  set_l(l) {
    l.l = this.l
    l.r = this
    this.l.r = l
    this.l = l
  }

  // 向上增加一个节点
  set_u(u) {
    u.u = this.u
    u.d = this
    this.u.d = u
    this.u = u
  }
}

class LinkedMatrix {
  /**
   * 十字链表
   * @constructor
   */
  constructor() {
    // 根节点
    this.root = new Node(-1, -1)

    // 剩余列节点 Array<Node>
    this.cols = []
  }

  // 隐藏列
  cover_column(col) {
    if (typeof col === 'number') {
      col = this.cols[col]
    }

    // 隐藏列节点的左右链
    col.hide_lr()

    // 从列节点向下遍历, 找到该列所有节点
    for (let row = col.d; row !== col; row = row.d) {
      // 找到该节点, 向右遍历, 找到该行的所有节点
      for (let node = row.r; node !== row; node = node.r) {
        // 移除该节点的上下链
        node.hide_ud()
        // 将该节点的列节点数自减
        --this.cols[node.x].size
      }
    }
  }

  // 恢复列
  uncover_column(col) {
    if (typeof col === 'number') {
      col = this.cols[col]
    }

    // 恢复该列节点的上下链
    col.show_lr()

    // 从列节点向上遍历, 找到该列所有节点
    for (let row = col.u; row !== col; row = row.u) {
      // 找到该节点, 向左遍历, 找到该行所有节点
      for (let node = row.l; node !== row; node = node.l) {
        // 恢复该节点的上下链
        node.show_ud()
        // 将该节点列节点数自增
        ++this.cols[node.x].size
      }
    }
  }

  // 将十字链表转化为密集表示法的 0,1 矩阵
  // 有关 0,1 矩阵的表示法 参考 https://github.com/jlaire/dlx.js/blob/master/lib/convert.js
  to_sparse() {
    let sparse = []
    let put = (x, y) => {
      while (sparse.length <= y) {
        sparse.push([])
      }
      sparse[y].push(x)
    }
    // 从十字链表的根节点开始, 向右遍历
    for (let col = this.root.r; col !== this.root; col = col.r) {
      // 从列节点开始, 向下遍历
      for( let row = col.d; row !== col; row = row.d) {
        put(col.x, row.y)
      }
    }
    // 将索引排序
    for (let xs of sparse) {
      xs.sort((a, b) => a - b)
    }
    return sparse
  }

  // 从密集表示法的 0,1 矩阵创建十字链表
  from_sparse(sparse) {
    if (sparse == null) return null
    let lm = new LinkedMatrix()

    // 创建并返回指定列的列节点
    let col = x => {
      while (lm.cols.length <= x) {
        let node = new Node(lm.cols.length, -1)
        lm.root.set_l(node)
        lm.cols.push(node)
      }
      return lm.cols[x]
    }

    // 遍历矩阵
    sparse.forEach((xs, y) => {
      // 创建行节点
      let row = new Node(-1, y)
      // 遍历每行的节点
      xs.forEach((x) => {
        // 创建子节点
        let node = new Node(x, y)
        // 将该节点与列节点链接
        col(x).set_u(node)
        // 将列节点的列节点数自增
        ++col(x).size
        // 将该节点与行节点链接
        row.set_l(node)
      })
      // 遍历完一行后, 移除行节点
      row.hide_lr()
    })
    return lm
  }

}

// DLX 核心
let DLX = {

  /**
   * 求解
   * @param  {LinkedMatrix} lm  十字链表实例
   * @return {number[][]}       结果
   */
  solve_linked_matrix(lm) {
    if (!(lm instanceof LinkedMatrix)) throw new TypeError('Argument is not a LinkedMatrix')
    let solutions = []
    DLX.dance(lm, [], solutions)
    return solutions
  },


  /**
   * dance
   * @param  {LinkedMatrix} lm      十字链表实例
   * @param  {number[]} stack       答案栈
   * @param  {number[][]} solutions 最优解数组
   */
  dance (lm, stack, solutions) {
    if (lm == null) return []
    if (lm.root.r === lm.root) {
      solutions.push([].concat(stack).sort((a, b) => a - b))
      return
    }

    // 找到列节点数最小的一列
    let best_col = lm.root.r
    for (let col = best_col.r; col !== lm.root; col = col.r) {
      if (col.size < best_col.size) best_col = col
    }

    // 如果列节点数都为 0, 求解失败, 返回答案
    if (best_col.size < 1) return solutions

    // 隐藏该列以及相关行
    lm.cover_column(best_col)

    for (let row = best_col.d; row !== best_col; row = row.d) {
      // 将当前行号压入答案栈
      stack.push(row.y)

      // 移除以解决的行及对应列
      for (let node = row.r; node !== row; node = node.r) {
        lm.cover_column(node.x)
      }

      // 递归求解新的十字链表
      DLX.dance(lm, stack, solutions)

      // 还原
      for (let node = row.l; node !== row; node = node.l) {
        lm.uncover_column(node.x)
      }
      stack.pop()
    }
    lm.uncover_column(best_col)
  },
}
