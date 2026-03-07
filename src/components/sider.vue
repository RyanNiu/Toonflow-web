<template>
  <aside class="sidebarContainer">
    <header class="sidebarHeader">
      <h1 class="sidebarTitle">
        <img class="logo" src="@/assets/logo.png" />
        Robou
      </h1>
      <p class="sidebarSubtitle">AI驱动的短剧创作工具</p>
    </header>
    <nav class="sidebarNav">
      sidebarTitle
      <button
        v-for="item in btnList"
        :key="item.path"
        :type="'button'"
        :class="['sidebarBtn', { sidebarBtnActive: item.path === activeMenu }]"
        @click="handleClick(item.path)">
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
    <div class="sidebarFooter">
      <button type="button" :class="['sidebarBtn', { sidebarBtnActive: activeMenu === 'settings' }]" @click="handleClick('/setting')">
        <i-setting-two size="20" />
        <span>设置</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import store from "@/stores";
import userStore from "@/stores/user";
const { activeMenu } = storeToRefs(store());
const user = userStore();
const { isAdmin } = storeToRefs(user);
// ,{path:"/taskList",label:"任务列表",icon:"i-list-two"}
const isAdminValue = computed(() => isAdmin.value || localStorage.getItem("is_admin") === "1");
const btnList = computed(() => [
  { path: "/project", label: "我的项目", icon: "i-folder-open" },
  ...(isAdminValue.value ? [{ path: "/accountManage", label: "账号管理", icon: "i-user" }] : []),
]);

const router = useRouter();
function handleClick(path: string) {
  router.push(path);
  activeMenu.value = path;
}
</script>

<style lang="scss" scoped>
.sidebarContainer {
  width: 16rem;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebarHeader {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--color-border);

  .sidebarTitle {
    font-size: 1.25rem;
    font-weight: 1000;
    color: var(--color-text);
    display: flex;
    align-items: center;
    .logo {
      width: 2.5rem;
      height: 2.5rem;
      margin-right: 0.2rem;
    }
  }

  .sidebarSubtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }
}

.sidebarNav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.sidebarFooter {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.sidebarBtn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: none;
  color: var(--color-text-muted);
  border: none;
  font: inherit;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}

.sidebarBtnActive {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
</style>
