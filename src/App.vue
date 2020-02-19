<template>
  <div class="container">
    <header>
      <h1 class="main-title">
        数独
      </h1>
      <div class="info-wrap">
        <span><strong id="difficult">正常</strong> level <span id="level">1</span></span>
        <br>
        <time id="time">0:00:00</time>
      </div>
    </header>

    <GameArea :game="game" />

    <footer>
      <button class="btn">
        查错
      </button>
      <button class="btn">
        重开
      </button>
    </footer>
  </div>
</template>

<script lang="ts">
import GameArea from './components/GameArea.vue'
import Game from './class/Game'

export default {
  components: {
    GameArea,
  },
  setup () {
    const game = new Game()
    window.game = game

    return {
      game,
    }
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
  background-color: $primary;

  .info-wrap {
    text-align: center;
  }
}
</style>
