<template>
  <div class="aboutPage">
    <t-card class="logoCard">
      <div class="logoSection">
        <img src="@/assets/logo.png" alt="Robou Logo" class="logo" />
        <h2 class="appName">Robou 短剧</h2>
        <t-tag theme="primary" variant="light">{{ version }}</t-tag>
      </div>
      <p class="desc">AI 驱动漫剧/短剧创作工具</p>
    </t-card>

    <t-card class="linkCard">
      <div class="linkItem" @click="openLink('https://github.com/HBAI-Ltd/Toonflow-app/releases')">
        <i-refresh theme="outline" size="20" />
        <span>检查更新 (GitHub)</span>
        <i-right theme="outline" size="16" class="arrow" />
      </div>
      <t-divider />
    </t-card>
  </div>
</template>

<script setup lang="ts">
import store from "@/stores/index";
const { version } = storeToRefs(store());
function openLink(url: string) {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
.aboutPage {
  gap: 16px;
  padding: 16px;
  max-width: 480px;
}

.logoCard {
  margin-bottom: 1rem;

  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
  }

  .logoSection {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 72px;
    height: 72px;
    border-radius: 16px;
  }

  .appName {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .desc {
    margin: 16px 0 0;
    font-size: 14px;
    color: var(--td-text-color-secondary);
    text-align: center;
  }
}

.linkCard {
  margin-bottom: 1rem;
  :deep(.t-card__body) {
    padding: 0;
  }

  :deep(.t-divider) {
    margin: 0;
  }

  .linkItem {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }

    span {
      flex: 1;
      font-size: 14px;
    }

    .arrow {
      color: var(--td-text-color-placeholder);
    }
  }
}

.licenseCard {
  :deep(.t-card__body) {
    padding: 16px;
  }

  .licenseInfo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: var(--td-text-color-secondary);
  }
}
</style>
