<template>
  <div class="onlineRoot">
    <header class="pageHeader">
      <div class="headerText">
        <div class="eyebrow">项目管理 · 在线版功能</div>
        <h2 class="title">{{ activeModule.label }}</h2>
        <p class="sub">该功能仅在线版本支持，当前为本地占位页面。</p>
      </div>
      <div class="badge">在线版专属</div>
    </header>

    <!-- <section class="modulePanel">
      <div class="panelHeader">
        <h3 class="panelTitle">功能入口</h3>
        <span class="panelHint">从左侧导航切换不同模块</span>
      </div>
      <div class="moduleGrid">
        <div v-for="module in modules" :key="module.path" :class="['moduleCard', { active: module.path === route.path }]">
          <div class="moduleName">{{ module.label }}</div>
          <p class="moduleDesc">{{ module.desc }}</p>
          <div class="moduleTag">在线版支持</div>
        </div>
      </div>
    </section> -->

    <section class="noticeCard">
      <div class="noticeHead">
        <div class="noticeTitle">提示</div>
        <!-- <div class="noticeTag">占位页面</div> -->
      </div>
      <p class="noticeText">该功能仅在线版本支持，如需使用请登录在线版或联系管理员。</p>
      <div class="placeholder">
        <div class="placeholderRow">
          <span class="placeholderBlock wide"></span>
          <span class="placeholderBlock"></span>
        </div>
        <div class="placeholderRow">
          <span class="placeholderBlock"></span>
          <span class="placeholderBlock"></span>
          <span class="placeholderBlock narrow"></span>
        </div>
        <div class="placeholderRow">
          <span class="placeholderBlock wide"></span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const modules = [
  { path: "/project-users", label: "用户管理", desc: "成员、角色与项目协作配置" },
  { path: "/project-permissions", label: "权限管理", desc: "访问控制与权限策略设置" },
  { path: "/project-cost", label: "成本跟踪", desc: "消耗统计与成本分析看板" },
  { path: "/project-monitor", label: "监控报表", desc: "进度、质量与运行监控指标" },
];

const activeModule = computed(() => modules.find((module) => module.path === route.path) ?? modules[0]);
</script>

<style lang="scss" scoped>
.onlineRoot {
  max-width: 112rem;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--color-text);
}

.pageHeader {
  padding: 1.75rem 2rem;
  background: linear-gradient(120deg, var(--color-surface), var(--color-surface-alt));
  border: var(--border-width-strong) solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.pageHeader::after {
  content: "";
  position: absolute;
  right: -60px;
  top: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.12);
  border: 2px dashed rgba(var(--color-primary-rgb), 0.3);
}

.headerText {
  position: relative;
  z-index: 1;
}

.eyebrow {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.title {
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0.4rem 0 0.6rem;
}

.sub {
  color: var(--color-text-muted);
  font-weight: 600;
}

.badge {
  position: relative;
  z-index: 1;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  border: var(--border-width-strong) solid var(--color-border-strong);
  font-weight: 800;
  color: var(--color-border-strong);
  box-shadow: var(--shadow-hard);
  white-space: nowrap;
}

.modulePanel {
  background: var(--color-surface);
  border: var(--border-width-strong) solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);
  padding: 1.5rem;
}

.panelHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.panelTitle {
  font-size: 1.1rem;
  font-weight: 800;
}

.panelHint {
  color: var(--color-text-muted);
  font-weight: 600;
}

.moduleGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.moduleCard {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-lg);
  border: var(--border-width-strong) solid var(--color-border);
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-hard);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 120px;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.moduleCard.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  transform: translate(-2px, -2px);
}

.moduleName {
  font-weight: 800;
  font-size: 1rem;
}

.moduleDesc {
  color: var(--color-text-muted);
  font-weight: 600;
  line-height: 1.5;
}

.moduleTag {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  padding: 0.25rem 0.8rem;
  border-radius: var(--radius-pill);
  border: var(--border-width-strong) solid var(--color-border-strong);
  background: var(--color-accent);
  color: var(--color-border-strong);
  font-size: 0.8rem;
  font-weight: 700;
}

.noticeCard {
  background: var(--color-surface);
  border: var(--border-width-strong) solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.noticeHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.noticeTitle {
  font-size: 1.05rem;
  font-weight: 800;
}

.noticeTag {
  padding: 0.25rem 0.8rem;
  border-radius: var(--radius-pill);
  border: var(--border-width-strong) solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 700;
  background: var(--color-surface-alt);
}

.noticeText {
  color: var(--color-text-muted);
  font-weight: 600;
  line-height: 1.6;
}

.placeholder {
  display: grid;
  gap: 0.75rem;
}

.placeholderRow {
  display: flex;
  gap: 0.75rem;
}

.placeholderBlock {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-border-soft), var(--color-surface-alt));
  border: 1px dashed var(--color-border);
}

.placeholderBlock.wide {
  flex: 2;
}

.placeholderBlock.narrow {
  flex: 0.7;
}

@media (max-width: 768px) {
  .pageHeader {
    flex-direction: column;
    align-items: flex-start;
  }

  .badge {
    align-self: flex-start;
  }
}
</style>
