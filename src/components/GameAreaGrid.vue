<template>
  <div :class="['game-area-grid', {highlight: grid.chunk % 2}]">
    {{ grid.value || '' }}
  </div>
</template>

<script lang="ts">
import Grid from '../class/Grid'

interface GameAreaGridProps {
  grid: Grid
}

export default {
  setup ({ grid }: GameAreaGridProps) {
    return {
      grid,
    }
  },
}
</script>

<style lang="scss" scoped>
.game-area-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #000;
  border-right: 1px solid $border-color;
  border-bottom: 1px solid $border-color;

  &.highlight {
    background-color: lighten($primary, 78%);
  }
}
</style>
