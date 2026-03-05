<template>
  <a-layout class="workbenchView">
    <a-layout-sider :style="siderStyle" :width="255">
      <sider />
    </a-layout-sider>
    <a-layout-content :style="contentStyle">
      <router-view></router-view>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import sider from "@/components/sider.vue";

import type { CSSProperties } from "vue";
const siderStyle: CSSProperties = {
  width: "255px",
  backgroundColor: "var(--color-surface)",
  borderRight: "1px solid var(--color-border)",
};

const contentStyle: CSSProperties = {
  background: "linear-gradient(180deg, var(--color-primary-soft) 0%, var(--color-surface-soft) 100%)",
  height: "100vh",
  overflow: "auto",
};
</script>

<style lang="scss" scoped>
.workbenchView {
  height: 100vh;
  width: 100vw;
}
</style>
