<template>
  <div class="game-area">
    <div v-for="(row, rowIndex) in grids" class="row">
      <div v-for="(col, colIndex) in row" class="col">
        {{col || ''}}
      </div>
    </div>
  </div>

  <footer>
    <button class="btn">撤销</button>
    <button class="btn">重做</button>
    <button class="btn">提示</button>
    <button class="btn">查错</button>
    <button class="btn">更多</button>
    <button class="btn">标记</button>
    <button class="btn">重开</button>
    <button class="btn">技能</button>
  </footer>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  setup() {
    // construct 2D array
    const grids = ref<number[][]>(new Array(9).fill([]))
    grids.value.forEach((row, index) => {
      grids.value[index] = new Array(9).fill(0)
    })

    return {
      grids,
    }
  },
}
</script>

<style lang="stylus" scoped>
.game-area {
  display: flex;
  flex-direction column;
  justify-content space-around
  width: 400px;
  height: 400px;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  margin: 12px 0;

  .row {
    display: flex;
    flex-direction row
    justify-content: space-around;
    height: 100%

    &:nth-child(3n+4) {
      border-top:1px solid #ddd;
    }

    .col {
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      width: 100%
      display: flex;
      align-items: center;
      justify-content: center;

      &:nth-child(3n+4) {
        border-left:1px solid #ddd;
      }
    }
  }
}
</style>
