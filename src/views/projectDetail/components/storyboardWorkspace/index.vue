<template>
  <div class="storyboard-workspace">
    <template v-if="scriptIdNum > 0">
      <storyboardChat embedded :project-id="projectIdNum" :script-id="scriptIdNum" @save="onSave" />
    </template>
    <div v-else class="empty-script">
      <p class="empty-script-title">请先在剧本管理中选择或创建剧本</p>
      <button class="btn-primary" @click="goScript">前往剧本管理</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from "@/stores";
import storyboardChat from "@/views/projectDetail/components/scriptManager/components/storyboardImage/storyboardChat.vue";

const route = useRoute();
const router = useRouter();

const projectIdNum = computed(() => Number(route.query.id) || 0);
const scriptIdNum = computed(() => store().currentScriptId ?? 0);

function onSave() {}

function goScript() {
  router.replace({ query: { ...route.query, tab: "script" } });
}
</script>

<style lang="scss" scoped>
.storyboard-workspace {
  height: 100%;
  min-height: 400px;
  overflow: hidden;
}
.empty-script {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 20px;
  .empty-script-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-muted);
  }
  .btn-primary {
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: var(--color-primary, #0052d9);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
