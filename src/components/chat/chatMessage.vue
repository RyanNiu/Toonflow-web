<template>
  <!-- 通知消息 -->
  <div v-if="msg.identity === 'notice'" class="notice-message">
    <span class="notice-text">{{ msg.data }}</span>
  </div>

  <!-- 对话消息 -->
  <div v-else class="message-wrapper" :class="[msg.identity === 'user' ? 'user' : 'assistant']">
    <!-- 消息内容 -->
    <div class="message-content-wrapper">
      <template v-if="msg.identity === 'assistant' && parsedData">
        <div v-for="item in parsedData" :key="item.index">
          <McBubble v-if="item.type === 'text'" :avatarConfig="{ imgSrc: logo, displayName: msg.role }" :avatarPosition="'top'" :variant="'bordered'">
            <McMarkdownCard :enableThink="true" :content="item.content" :theme="theme"></McMarkdownCard>
          </McBubble>
          <McBubble
            v-if="item.type === 'thinking'"
            :loading="true"
            :avatarConfig="{ imgSrc: logo, displayName: msg.role }"
            :avatarPosition="'top'"></McBubble>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) in msg.data" :key="index">
          <McBubble v-if="item.type === 'text'" :align="'right'">
            <McMarkdownCard :enableThink="true" :content="item.text" :theme="theme"></McMarkdownCard>
          </McBubble>
          <McBubble v-if="item.type === 'image_url'" :content="item.image_url" :align="'right'"></McBubble>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/logo.svg";
import { computed, reactive } from "vue";
import { UserOutlined, DownOutlined } from "@ant-design/icons-vue";
const theme = ref("light");

const props = defineProps<{
  msg: ChatMessage;
  sendApi: (msg: string) => void;
}>();

// 思考块折叠状态
const thinkingCollapsed = reactive<Record<number, boolean>>({});

// 解析文本中的 <think>...</think> 标签
function parseThinkingContent(text: string): { thinking: string | null; content: string } {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(thinkRegex);

  if (match) {
    const thinking = match[1].trim();
    const content = text.replace(thinkRegex, "").trim();
    return { thinking, content };
  }

  return { thinking: null, content: text };
}

// 解析后的消息项类型
interface ParsedMessageItem {
  type: string;
  index: number;
  thinking?: string | null;
  content?: string;
  text?: string;
  image_url?: { url: string };
  button?: { text: string; type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default"; fn?: Function }[];
  confirm?: boolean;
}

// 处理后的消息数据
const parsedData = computed<ParsedMessageItem[] | null>(() => {
  if (props.msg.identity !== "assistant") return null;

  return props.msg.data.map((item, index): ParsedMessageItem => {
    if (item.type === "text") {
      const { thinking, content } = parseThinkingContent(item.text);
      return {
        type: item.type,
        text: item.text,
        thinking,
        content,
        index,
      };
    }
    return { ...item, index } as ParsedMessageItem;
  });
});

// 切换思考块折叠状态
function toggleThinking(index: number) {
  thinkingCollapsed[index] = !thinkingCollapsed[index];
}

// 获取折叠状态（默认折叠）
function isCollapsed(index: number): boolean {
  return thinkingCollapsed[index] !== false;
}

function handleClick(
  sub: {
    text: string;
    type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
    fn?: Function;
  },
  item: AssistantMessageTextWithConfirm,
) {
  sub.fn ? sub.fn() : props.sendApi(sub.text);
  item.confirm = true;
}
</script>

<style lang="scss" scoped>
.notice-message {
  display: flex;
  justify-content: center;
  padding: 8px 0;

  .notice-text {
    padding: 6px 16px;
    background: var(--color-surface-alt);
    border-radius: 16px;
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;

  &.user {
    flex-direction: row-reverse;
    margin-left: auto;
  }

  &.assistant {
    margin-right: auto;
  }
}

.avatar {
  flex-shrink: 0;

  .ai-avatar {
    background: var(--gradient-primary);

    .avatar-text {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .user-avatar {
    background: var(--gradient-primary);
  }
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;

  &.assistant-bubble {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border-soft);
    border-bottom-left-radius: 6px;
    box-shadow: 0 1px 3px rgba(var(--color-ink-rgb), 0.04);
  }

  &.user-bubble {
    background: var(--gradient-primary);
    color: var(--color-surface);
    border-bottom-right-radius: 6px;
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.25);
  }
}

.text-content {
  display: block;
  white-space: pre-wrap;
}

.image-content {
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
}

.confirm-content {
  .confirm-text {
    margin: 0 0 12px;
  }

  .confirm-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    .confirm-btn {
      border-radius: 8px;
    }
  }

  .confirm-result {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;

    .result-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;

      &.success {
        background: var(--color-success-soft);
        color: var(--color-success);
      }

      &.error {
        background: var(--color-error-soft);
        color: var(--color-error);
      }
    }

    .result-text {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  .thinking-dot {
    width: 8px;
    height: 8px;
    background: var(--color-text-weak);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 折叠动画
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 400px;
}

// 思考过程折叠块样式
.thinking-block {
  background: linear-gradient(135deg, var(--color-surface-soft) 0%, var(--color-primary-soft) 100%);
  border: 1px solid var(--color-border-soft);
  border-radius: 12px;
  overflow: hidden;

  .thinking-block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(var(--color-primary-rgb), 0.06);
    }

    .thinking-icon {
      font-size: 16px;
    }

    .thinking-title {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-primary);
    }

    .thinking-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--color-primary);
      transition: transform 0.3s ease;

      &.collapsed {
        transform: rotate(-90deg);
      }
    }
  }

  .thinking-block-content {
    border-top: 1px solid var(--color-border-soft);
    background: rgba(var(--color-surface-rgb), 0.6);

    .thinking-text {
      padding: 12px 14px;
      font-size: 13px;
      line-height: 1.8;
      color: var(--color-text-muted);
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: 2px;
      }
    }
  }
}
:deep(.hljs) {
  text-wrap: wrap;
}
</style>
