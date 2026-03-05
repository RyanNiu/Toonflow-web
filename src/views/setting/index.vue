<template>
  <div class="setting">
    <div class="setting-header">
      <h1>设置中心</h1>
      <p>集中管理主题、模型与系统配置</p>
    </div>
    <t-tabs v-model="activeTab" theme="card" class="setting-tabs">
      <t-tab-panel value="theme" label="主题">
        <skeleton title="主题" divider>
          <themeConfig />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel v-if="isAdminValue" value="request" label="请求配置">
        <skeleton title="请求地址配置" divider>
          <requestConfig />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel value="login" label="登录">
        <skeleton title="登录配置" divider>
          <loginConfig />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel value="llm" label="语言模型">
        <skeleton title="语言模型配置" divider>
          <aiConfog />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel value="video" label="视频模型">
        <skeleton title="视频模型配置" divider>
          <videoModelConfig />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel value="prompt" label="提示词">
        <skeleton title="提示词配置" divider>
          <promptsEdit />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel v-if="isAdminValue" value="other" label="其他">
        <skeleton title="其他配置" divider>
          <otherConfig />
        </skeleton>
      </t-tab-panel>
      <t-tab-panel v-if="isAdminValue" value="db" label="数据库">
        <skeleton title="数据库操作" divider>
          <dbConfig />
        </skeleton>
      </t-tab-panel>
      <!-- <t-tab-panel value="about" label="关于">
        <skeleton title="关于" divider>
          <about />
        </skeleton>
      </t-tab-panel> -->
      <t-tab-panel value="logout" label="退出登录">
        <skeleton title="退出登录" divider>
          <logoutConfig />
        </skeleton>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import userStore from "@/stores/user";
import skeleton from "./skeleton.vue";
import themeConfig from "./components/themeConfig.vue";
import requestConfig from "./components/requestConfig.vue";
import loginConfig from "./components/loginConfig.vue";
import aiConfog from "./components/aiConfog.vue";
import videoModelConfig from "./components/videoModelConfig.vue";
import promptsEdit from "./components/promptsEdit.vue";
import dbConfig from "./components/dbConfig.vue";
import otherConfig from "./components/otherConfig.vue";
import about from "./components/about.vue";
import logoutConfig from "./components/logoutConfig.vue";

const activeTab = ref("theme");
const user = userStore();
const { isAdmin } = storeToRefs(user);
const isAdminValue = computed(() => isAdmin.value);
const adminOnlyTabs = new Set(["request", "other", "db"]);

const ensureTabAccess = () => {
  if (!isAdminValue.value && adminOnlyTabs.has(activeTab.value)) {
    activeTab.value = "theme";
  }
};

watch(isAdminValue, ensureTabAccess, { immediate: true });
watch(activeTab, ensureTabAccess);
</script>

<style lang="scss" scoped>
.setting {
  padding: 32px 48px 48px;
  width: 100%;
  height: 100%;

  .setting-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px 20px;
    border: var(--border-width-strong) solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-hard);
    background: var(--color-surface);

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }

    p {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-muted);
    }
  }

  .setting-tabs {
    background: var(--color-surface);
    border: var(--border-width-strong) solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-hard);
    padding: 12px;
  }

  :deep(.t-tabs__nav) {
    background: var(--color-surface-alt);
    border: var(--border-width-strong) solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    padding: 6px;
  }

  :deep(.t-tabs__nav-item) {
    border-radius: var(--radius-md);
    font-weight: 700;
  }

  :deep(.t-tabs__nav-item.t-is-active) {
    background: var(--color-accent);
    color: var(--color-border-strong);
    border: var(--border-width-strong) solid var(--color-border-strong);
  }

  :deep(.t-tabs__content) {
    padding: 16px 8px 8px;
  }
}
</style>
