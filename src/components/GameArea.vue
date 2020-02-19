<template>
  <div class="game-area">
    <div
      v-for="(row, rowIndex) in grids"
      :key="rowIndex"
      class="row"
    >
      <GameAreaGrid
        v-for="(grid, colIndex) in row"
        :key="colIndex"
        :grid="grid"
        @click="focusOn = [rowIndex, colIndex]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'
import Game from '../class/Game'
import Grid from '../class/Grid'
import GameAreaGrid from './GameAreaGrid.vue'

interface GameAreaProps {
  game: Game
}

export default {
  components: { GameAreaGrid },
  setup ({ game }: GameAreaProps) {
    const grids = reactive<Grid[][]>(game.grids)
    const focusOn = ref<[ number, number ] | null>(null)

    return {
      grids,
      focusOn,
    }
  },
}
</script>

<style lang="scss" scoped>
.game-area {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 400px;
  height: 400px;
  margin: 12px 0;
  background-color: #fff;
  border-top: 1px solid $border-color;
  border-left: 1px solid $border-color;

  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    height: 100%;
  }
}
</style>
