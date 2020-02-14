<template>
  <p id="debug" style="margin: 0;height: 24px;overflow: visible;"></p>
  <header>
    <h1 class="main-title">数独</h1>
    <div class="info-wrap">
      <span><strong id="difficult">正常</strong> level <span id="level">1</span></span>
      <br>
      <time id="time">0:00:00</time>
    </div>
  </header>

  <GameArea></GameArea>


</template>

<script>
import { ref } from 'vue'
import GameArea from './components/GameArea'

export default {
  components: {
    GameArea,
  },
  setup() {
    const count = ref(0)
    const inc = () => {
      count.value++
    }

    return {
      count,
      inc,
    }
  },
}
</script>

<style scoped>
h1 {
  margin: 0;
}
</style>
