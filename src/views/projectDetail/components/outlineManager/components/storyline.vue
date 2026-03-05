<template>
  <div class="storyline-container">
    <!-- 头部区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">故事线管理</h1>
        <p class="page-desc">根据上传的小说原文生成大纲和故事线</p>
      </div>
      <t-button class="edit-btn" @click="handleAddStoreline">
        <i-edit :size="16" v-if="!storylineChanged" />
        <i-preview-open :size="16" v-else />
        {{ storylineChanged ? "预览模式" : "编辑故事线" }}
      </t-button>
    </div>

    <!-- 内容区域 -->
    <div class="storyline-content">
      <div class="content-card">
        <!-- 有内容时 -->
        <template v-if="storyLine || storylineChanged">
          <!-- 预览模式 -->
          <div class="preview-box" v-if="!storylineChanged">
            <div class="preview-header">
              <span class="preview-icon">📖</span>
              <span class="preview-title">故事线内容</span>
            </div>
            <div class="preview-text">{{ storyLine }}</div>
          </div>

          <!-- 编辑模式 -->
          <div class="edit-box" v-else>
            <div class="edit-header">
              <span class="edit-icon">✏️</span>
              <span class="edit-title">编辑故事线</span>
              <span class="edit-tip">支持多行输入，描述完整的故事脉络</span>
            </div>
            <t-textarea
              v-model="storyLine"
              placeholder="请输入故事线，包括主要情节、角色发展、冲突转折等..."
              class="storyline-textarea"
              :autosize="{ minRows: 12, maxRows: 24 }"
              :maxlength="5000"
              @change="handleChange" />
          </div>
        </template>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
          <div class="empty-icon">📝</div>
          <p class="empty-title">暂无故事线</p>
          <p class="empty-desc">点击上方"编辑故事线"开始创作</p>
          <t-button theme="primary" class="empty-btn" @click="handleAddStoreline">开始编辑</t-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar" v-if="storylineChanged">
        <div class="action-tips"></div>
        <div class="action-btns">
          <t-button variant="outline" class="cancel-btn" @click="handleCancel">取消</t-button>
          <t-button theme="primary" class="save-btn" @click="save">
            <i-check :size="16" />
            保存
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const storyLine = defineModel<string>({
  default: "",
});

const storylineChanged = ref(false);
const storylineBackup = ref("");

const emit = defineEmits(["save"]);

function handleAddStoreline() {
  storylineChanged.value = !storylineChanged.value;
  if (storylineChanged.value) {
    storylineBackup.value = storyLine.value;
  }
}

function handleChange() {
  storylineChanged.value = true;
}

function handleCancel() {
  storyLine.value = storylineBackup.value;
  storylineChanged.value = false;
}

function save() {
  emit("save", storyLine.value);
  storylineChanged.value = false;
}
</script>

<style lang="scss" scoped>
.storyline-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: transparent;
  min-height: 100%;
}

// 头部样式
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: var(--border-width-strong) solid var(--color-border-strong);
  box-shadow: var(--shadow-hard);

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 6px;
      color: var(--color-text);
    }
    .page-desc {
      margin: 0;
      opacity: 1;
      font-size: 14px;
      color: var(--color-text-muted);
      font-weight: 600;
    }
  }

  .edit-btn {
    background: var(--color-accent);
    border: var(--border-width-strong) solid var(--color-border-strong);
    color: var(--color-border-strong);
    height: 40px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    transition: all 0.3s;

    &:hover {
      transform: translate(-2px, -2px);
    }
  }
}

// 内容区域
.storyline-content {
  .content-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-hard);
    border: var(--border-width-strong) solid var(--color-border-strong);
  }
}

// 预览模式
.preview-box {
  padding: 24px;

  .preview-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: var(--border-width-strong) solid var(--color-border-strong);

    .preview-icon {
      font-size: 20px;
    }

    .preview-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-text);
    }
  }

  .preview-text {
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.8;
    color: var(--color-text-muted);
    font-size: 14px;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border-strong);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--color-border-strong);
    }
  }
}

// 编辑模式
.edit-box {
  padding: 24px;

  .edit-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;

    .edit-icon {
      font-size: 18px;
    }

    .edit-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-text);
    }

    .edit-tip {
      margin-left: auto;
      font-size: 12px;
      color: var(--color-text-muted);
      font-weight: 600;
    }
  }

  .storyline-textarea {
    border: var(--border-width-strong) solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    font-size: 14px;
    line-height: 1.8;
    transition: all 0.3s;
    resize: none;

    &:hover {
      border-color: var(--color-border-strong);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 3px 3px 0 rgba(var(--color-primary-rgb), 0.6);
    }
  }
}

// 空状态
.empty-state {
  padding: 80px 20px;
  text-align: center;
  background: var(--color-surface);
  border: var(--border-width-strong) dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);

  .empty-icon {
    font-size: 56px;
    margin-bottom: 20px;
    color: var(--color-border-strong);
  }

  .empty-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--color-text);
    margin: 0 0 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: var(--color-text-muted);
    font-weight: 600;
    margin: 0 0 24px;
  }

  .empty-btn {
    background: var(--color-primary);
    border: var(--border-width-strong) solid var(--color-border-strong);
    height: 42px;
    padding: 0 28px;
    font-weight: 800;
    font-size: 14px;

    &:hover {
      transform: translate(-2px, -2px);
    }
  }
}

// 操作栏
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: var(--border-width-strong) solid var(--color-border-strong);
  box-shadow: var(--shadow-hard);

  .action-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .action-btns {
    display: flex;
    gap: 12px;

    .cancel-btn {
      height: 38px;
      padding: 0 20px;
      border-radius: var(--radius-md);
      font-weight: 800;
      border: var(--border-width-strong) solid var(--color-border-strong);

      &:hover {
        transform: translate(-2px, -2px);
      }
    }

    .save-btn {
      height: 38px;
      padding: 0 24px;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      border: var(--border-width-strong) solid var(--color-border-strong);
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      box-shadow: var(--shadow-hard);

      &:hover {
        transform: translate(-2px, -2px);
      }
    }
  }
}
</style>
