<template>
  <div class="game-area"></div>

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

<script>
export default {
  setup() {
    return {}
  }
}
</script>

<style scoped>
.game-area {
  width: 400px;
  height: 400px;
  border: 1px solid #ddd;
  margin: 12px 0;
}
</style>
