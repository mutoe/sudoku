<template>
  <div class="game-area">
    <div
      v-for="(row, rowIndex) in grids"
      :key="rowIndex"
      class="row"
    >
      <div
        v-for="(col, colIndex) in row"
        :key="colIndex"
        :class="['col', {highlight: getTrunks(rowIndex, colIndex) % 2}]"
      >
        {{ colIndex }}
      </div>
    </div>
  </div>

  <footer>
    <!--<button class="btn">撤销</button>-->
    <button class="btn">查错</button>
    <button class="btn">重开</button>
  </footer>
</template>

<script lang="ts">
import { reactive } from 'vue'

export default {
  setup() {
    // construct 2D array
    const grids = reactive<number[][]>(new Array(9).fill([]))
    grids.forEach((_, i) => (grids[i] = new Array(9).fill(0)))

    const getTrunks = (row: number, col: number) => ~~(row / 3) * 3 + ~~(col / 3)

    return {
      grids,
      getTrunks,
    }
  },
}
</script>

<style lang="scss" scoped>
$border-color: lighten($primary, 40%);

.game-area {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 400px;
  height: 400px;
  border-top: 1px solid $border-color;
  border-left: 1px solid $border-color;
  margin: 12px 0;
  background-color: #fff;

  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 100%;

    .col {
      border-right: 1px solid $border-color;
      border-bottom: 1px solid $border-color;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;

      &.highlight {
        background-color: lighten($primary, 78%);
      }
    }
  }
}
</style>
