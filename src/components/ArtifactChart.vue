<template>
  <div class="chart-layout">
    <Gchart type="Sankey" />
  </div>
</template>

<script setup lang="ts">
import Gchart from './SankeyChart'
</script>

<style lang="scss" scoped>
.chart-layout {
  display: flex;
  justify-content: center;
  margin: 5rem 0 0;
}
</style>
