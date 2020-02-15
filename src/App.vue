<template>

  <div class="container">
    <header>
      <h1 class="main-title">数独</h1>
      <div class="info-wrap">
        <span><strong id="difficult">正常</strong> level <span id="level">1</span></span>
        <br>
        <time id="time">0:00:00</time>
      </div>
    </header>

    <GameArea></GameArea>
  </div>

</template>

<script lang="ts">
import GameArea from './components/GameArea.vue'

export default {
  components: {
    GameArea,
  },
  setup() {
    return {}
  },
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  height: 100%
}

#app {
  height: 100%
}
</style>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $primary;
  color: #fff;
  height: 100%;

  .info-wrap {
    text-align: center;
  }
}
</style>
