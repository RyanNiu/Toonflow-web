<template>
  <div class="storyboard-standalone">
    <!-- 面包屑 + 返回 -->
    <div class="detailHeader">
      <div class="headerBar">
        <div class="headerLeft">
          <button class="backBtn" @click="onBack" type="button">
            <i-left :size="20" />
          </button>
          <nav class="breadcrumb">
            <span class="breadcrumb-item link" @click="goProject">{{ workspace.projectName || '项目' }}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item">生成分镜图</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item link" @click="goScript">{{ workspace.scriptName || '剧本' }}</span>
          </nav>
        </div>
      </div>
    </div>

    <!-- 无剧本时提示 -->
    <div v-if="!scriptIdNum || scriptIdNum <= 0" class="empty-script">
      <p class="empty-script-title">请先在剧本管理中选择或创建剧本</p>
      <button class="btn-primary" @click="goScript">前往剧本管理</button>
    </div>

    <!-- 分镜工作台（嵌入模式） -->
    <div v-else class="workspace">
      <storyboardChat
        embedded
        :project-id="projectIdNum"
        :script-id="scriptIdNum"
        @save="onSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/utils/axios";
import storyboardChat from "@/views/projectDetail/components/scriptManager/components/storyboardImage/storyboardChat.vue";

const route = useRoute();
const router = useRouter();

const projectIdNum = computed(() => Number(route.params.projectId) || 0);
const scriptIdNum = computed(() => Number(route.params.scriptId) || 0);

const workspace = ref<{ projectName: string; scriptName: string }>({
  projectName: "",
  scriptName: "",
});

async function fetchWorkspaceInfo() {
  if (!projectIdNum.value || !scriptIdNum.value) return;
  try {
    const res = await axios.get("/storyboard/getWorkspaceInfo", {
      params: { projectId: projectIdNum.value, scriptId: scriptIdNum.value },
    });
    const payload = (res && typeof res === "object" && "data" in res ? res.data : res) as { projectName?: string; scriptName?: string } | undefined;
    if (payload?.projectName !== undefined) workspace.value.projectName = payload.projectName;
    if (payload?.scriptName !== undefined) workspace.value.scriptName = payload.scriptName;
  } catch (e) {
    console.warn("getWorkspaceInfo failed", e);
  }
}

onMounted(() => fetchWorkspaceInfo());
watch([projectIdNum, scriptIdNum], () => fetchWorkspaceInfo());

function onBack() {
  router.push({ path: "/projectDetail", query: { id: String(projectIdNum.value) } });
}

function goProject() {
  router.push({ path: "/projectDetail", query: { id: String(projectIdNum.value) } });
}

function goScript() {
  router.push({ path: "/projectDetail", query: { id: String(projectIdNum.value), tab: "script" } });
}

function onSave() {
  // 独立页内保存由 WS + 后端自动处理，此处仅兼容 emit
}
</script>

<style lang="scss" scoped>
.storyboard-standalone {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 800px;
  background: var(--color-surface-soft, #f5f5f5);
}

.detailHeader {
  flex-shrink: 0;
  padding: 16px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-strong, #e0e0e0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.headerBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.backBtn {
  padding: 8px;
  color: var(--color-text);
  border-radius: 8px;
  background: var(--color-accent);
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease;
  &:hover {
    transform: translate(-2px, -2px);
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  .breadcrumb-sep {
    color: var(--color-text-muted);
    user-select: none;
  }
  .breadcrumb-item {
    &.link {
      cursor: pointer;
      color: var(--color-primary, #0052d9);
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.empty-script {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
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

.workspace {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
