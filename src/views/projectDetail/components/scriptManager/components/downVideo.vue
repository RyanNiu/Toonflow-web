<template>
  <div class="batch-download">
    <!-- 头部区域 -->
    <div class="header">
      <div class="title">
        <div class="icon-wrapper">
          <i-download :size="20" class="icon" />
        </div>
        <span>批量下载</span>
        <span v-if="downloadableCount" class="count-badge">{{ downloadableCount }} 个可下载</span>
      </div>
      <button @click="down" :disabled="!hasDownloadableVideos" class="download-btn">
        <i-check-correct :size="18" />
        <span>选择视频</span>
      </button>
    </div>

    <!-- 选择弹窗 -->
    <a-modal v-model:open="visible" :title="null" width="85vw" centered :footer="null" wrapClassName="download-modal">
      <div class="modal-content">
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <div class="modal-title">
            <i-video-two :size="24" />
            <span>选择要下载的视频</span>
          </div>
          <button class="close-btn" @click="visible = false">
            <i-close :size="20" />
          </button>
        </div>

        <!-- 操作栏 -->
        <div class="action-bar">
          <div class="select-info">
            <div class="info-left">
              <span class="select-count">
                已选择
                <strong>{{ selectedKeys.length }}</strong>
                / {{ videoData.length }}
              </span>
              <span v-if="selectedKeys.length > 0" class="selected-hint">(共 {{ formatFileSize(estimatedSize) }})</span>
            </div>
            <div class="info-right">
              <button class="select-all-btn" @click="toggleSelectAll">
                <i-check-correct v-if="!isAllSelected" :size="16" />
                <i-close-one v-else :size="16" />
                {{ isAllSelected ? "取消全选" : "全选" }}
              </button>
            </div>
          </div>
        </div>

        <!-- 视频列表 -->
        <div class="video-list">
          <div v-if="videoData.length" class="video-grid">
            <div
              v-for="(item, index) in videoData"
              :key="item.id"
              :class="['video-card', { selected: isSelected(item.id), disabled: !item.filePath }]"
              @click="item.filePath && toggleSelect(item.id)">
              <!-- 选中标记 -->
              <div class="select-indicator" v-if="isSelected(item.id)">
                <i-check :size="16" />
              </div>

              <!-- 不可用标记 -->
              <div class="unavailable-badge" v-if="!item.filePath">不可用</div>

              <!-- 缩略图 -->
              <div class="thumb-wrapper">
                <img :src="item.firstFrame" alt="视频封面" class="video-thumb" @error="handleImageError" />
                <div class="thumb-overlay">
                  <div class="play-icon">
                    <i-play :size="24" />
                  </div>
                </div>
              </div>

              <!-- 视频信息 -->
              <div class="video-info">
                <h4 class="video-title">视频 #{{ index + 1 }}</h4>
                <div class="video-meta">
                  <span class="meta-tag resolution">
                    <i-pic :size="12" />
                    {{ item.resolution || "未知" }}
                  </span>
                  <span class="meta-tag model">
                    <i-cpu :size="12" />
                    {{ item.model || "未知" }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i-video-two :size="48" />
            </div>
            <p class="empty-title">暂无视频</p>
            <p class="empty-desc">没有可供下载的视频</p>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="modal-footer">
          <button class="cancel-btn" @click="visible = false">取消</button>
          <button class="confirm-btn" :disabled="selectedKeys.length === 0" @click="handleDownload">
            <i-download :size="18" />
            <span>下载选中项 ({{ selectedKeys.length }})</span>
          </button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import JSZip from "jszip";

interface VideoData {
  id: number;
  time: number;
  model: string;
  scriptId: number;
  resolution: string;
  prompt: string;
  storyboardImgs: string[];
  firstFrame: string;
  filePath: string;
  state: 0 | -1 | 1;
}

const videoData = defineModel<VideoData[]>({ default: [] });

const visible = ref(false);
const selectedKeys = ref<number[]>([]);

const hasDownloadableVideos = computed(() => videoData.value.some((v) => v.filePath));
const downloadableCount = computed(() => videoData.value.filter((v) => v.filePath).length);
const isAllSelected = computed(() => {
  const downloadable = videoData.value.filter((v) => v.filePath);
  return selectedKeys.value.length === downloadable.length && downloadable.length > 0;
});

// 估算文件大小（假设每个视频约 5MB）
const estimatedSize = computed(() => selectedKeys.value.length * 5 * 1024 * 1024);

const isSelected = (id: number) => selectedKeys.value.includes(id);

const toggleSelect = (id: number) => {
  const index = selectedKeys.value.indexOf(id);
  if (index > -1) {
    selectedKeys.value.splice(index, 1);
  } else {
    selectedKeys.value.push(id);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedKeys.value = [];
  } else {
    selectedKeys.value = videoData.value.filter((v) => v.filePath).map((v) => v.id);
  }
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function down() {
  visible.value = true;
  selectedKeys.value = videoData.value.filter((v) => v.filePath).map((v) => v.id);
}

async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("文件无法访问");

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error("下载失败:", error);
    throw error;
  }
}

async function handleDownload() {
  if (selectedKeys.value.length === 0) {
    message.warning("请至少选择一个视频");
    return;
  }

  const selectedVideos = videoData.value.filter((v) => selectedKeys.value.includes(v.id) && v.filePath);

  if (selectedVideos.length === 0) {
    message.warning("选中的视频没有可下载的文件");
    return;
  }

  const loadingKey = "download";
  message.loading({
    content: `正在打包 ${selectedVideos.length} 个视频...`,
    key: loadingKey,
    duration: 0,
  });

  try {
    const zip = new JSZip();

    // 下载所有视频并添加到压缩包
    for (let i = 0; i < selectedVideos.length; i++) {
      const video = selectedVideos[i];
      const videoIndex = videoData.value.findIndex((v) => v.id === video.id) + 1;
      const filename = `视频_${videoIndex}.mp4`;

      message.loading({
        content: `正在处理 ${i + 1}/${selectedVideos.length}: ${filename}`,
        key: loadingKey,
        duration: 0,
      });

      try {
        const response = await fetch(video.filePath);
        if (!response.ok) throw new Error(`无法获取视频: ${filename}`);

        const blob = await response.blob();
        zip.file(filename, blob);
      } catch (error) {
        console.error(`下载视频失败: ${filename}`, error);
        // 继续处理其他视频
      }
    }

    // 生成压缩包
    message.loading({
      content: "正在生成压缩包...",
      key: loadingKey,
      duration: 0,
    });

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    // 下载压缩包
    const blobUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `下载视频_${new Date().getTime()}.zip`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);

    message.success({ content: "下载完成!", key: loadingKey });
    visible.value = false;
  } catch (error) {
    console.error("打包下载错误:", error);
    message.error({ content: "打包失败,请重试", key: loadingKey });
  }
}

function handleImageError(e: Event) {
  (e.target as HTMLImageElement).src = "/default-thumb.png";
}
</script>

<style lang="scss" scoped>
.batch-download {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    margin-top: 20px;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: var(--border-width-strong) solid var(--color-border-strong);
    box-shadow: var(--shadow-hard);

    .title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 16px;
      color: var(--color-text);

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--color-accent);
        border-radius: var(--radius-md);
        border: var(--border-width-strong) solid var(--color-border-strong);
        box-shadow: var(--shadow-hard);

        .icon {
          color: var(--color-border-strong);
        }
      }

      .count-badge {
        padding: 2px 10px;
        background: var(--color-accent);
        color: var(--color-border-strong);
        border-radius: var(--radius-pill);
        font-size: 12px;
        font-weight: 800;
        border: var(--border-width-strong) solid var(--color-border-strong);
      }
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--color-primary);
      color: var(--color-surface);
      border: var(--border-width-strong) solid var(--color-border-strong);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-hard);

      &:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: var(--shadow-hard-hover);
      }

      &:disabled {
        background: var(--color-border);
        box-shadow: none;
        cursor: not-allowed;
      }
    }
  }
}

.modal-content {
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: var(--border-width-strong) solid var(--color-border-strong);
    background: var(--color-surface);

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 800;
      color: var(--color-text);
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--color-accent);
      border: var(--border-width-strong) solid var(--color-border-strong);
      border-radius: var(--radius-md);
      color: var(--color-border-strong);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translate(-2px, -2px);
      }
    }
  }

  .action-bar {
    padding: 16px 24px;
    background: var(--color-surface-alt);
    border-bottom: var(--border-width-strong) solid var(--color-border-strong);

    .select-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .info-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .select-count {
          font-size: 14px;
          color: var(--color-text);
          font-weight: 700;

          strong {
            color: var(--color-primary);
            font-size: 16px;
          }
        }

        .selected-hint {
          font-size: 13px;
          color: var(--color-text-muted);
          font-weight: 600;
        }
      }

      .select-all-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--color-accent);
        border: var(--border-width-strong) solid var(--color-border-strong);
        border-radius: var(--radius-md);
        font-size: 14px;
        font-weight: 800;
        color: var(--color-border-strong);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: translate(-2px, -2px);
        }
      }
    }
  }

  .video-list {
    padding: 24px;
    max-height: 55vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--color-surface-alt);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 3px;

      &:hover {
        background: var(--color-text-weak);
      }
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    .video-card {
      position: relative;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      border: var(--border-width-strong) solid var(--color-border-strong);
      box-shadow: var(--shadow-hard);

      &:hover:not(.disabled) {
        transform: translate(-2px, -2px);
        box-shadow: var(--shadow-hard-hover);

        .thumb-overlay {
          opacity: 1;
        }
      }

      &.selected {
        border-color: var(--color-border-strong);
        box-shadow: var(--shadow-hard);

        .select-indicator {
          opacity: 1;
          transform: scale(1);
        }
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;

        .thumb-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(var(--color-ink-rgb), 0.3);
        }
      }

      .select-indicator {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 10;
        width: 28px;
        height: 28px;
        background: var(--color-accent);
        border-radius: var(--radius-md);
        border: var(--border-width-strong) solid var(--color-border-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-border-strong);
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.2s ease;
        box-shadow: var(--shadow-hard);
      }

      .unavailable-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        padding: 4px 10px;
        background: var(--color-error);
        color: var(--color-surface);
        border-radius: var(--radius-md);
        font-size: 12px;
        font-weight: 800;
        border: var(--border-width-strong) solid var(--color-border-strong);
      }

      .thumb-wrapper {
        position: relative;
        width: 100%;
        height: 140px;
        overflow: hidden;
        background: var(--color-surface-alt);

        .video-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(var(--color-ink-rgb), 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          .play-icon {
            width: 50px;
            height: 50px;
            background: var(--color-accent);
            border-radius: var(--radius-md);
            border: var(--border-width-strong) solid var(--color-border-strong);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-border-strong);
          }
        }
      }

      .video-info {
        padding: 14px;

        .video-title {
          margin: 0 0 10px;
          font-size: 14px;
          font-weight: 800;
          color: var(--color-text);
        }

        .video-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .meta-tag {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: var(--radius-pill);
            font-size: 11px;
            font-weight: 800;
            border: var(--border-width-strong) solid var(--color-border-strong);

            &.resolution {
              background: var(--color-accent);
              color: var(--color-border-strong);
            }

            &.model {
              background: var(--color-surface-alt);
              color: var(--color-text);
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;

      .empty-icon {
        width: 80px;
        height: 80px;
        background: var(--color-accent);
        border-radius: var(--radius-md);
        border: var(--border-width-strong) solid var(--color-border-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-border-strong);
        margin-bottom: 20px;
      }

      .empty-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 800;
        color: var(--color-text);
      }

      .empty-desc {
        margin: 0;
        font-size: 14px;
        color: var(--color-text-muted);
        font-weight: 600;
      }
    }
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: var(--border-width-strong) solid var(--color-border-strong);
    background: var(--color-surface-alt);

    .cancel-btn {
      padding: 10px 24px;
      background: var(--color-surface);
      border: var(--border-width-strong) solid var(--color-border-strong);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translate(-2px, -2px);
      }
    }

    .confirm-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: var(--color-primary);
      border: var(--border-width-strong) solid var(--color-border-strong);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 800;
      color: var(--color-surface);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-hard);

      &:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: var(--shadow-hard-hover);
      }

      &:disabled {
        background: var(--color-border);
        box-shadow: none;
        cursor: not-allowed;
      }
    }
  }
}
</style>

<style lang="scss">
.download-modal {
  .ant-modal-content {
    padding: 0;
    border-radius: var(--radius-lg);
    border: var(--border-width-strong) solid var(--color-border-strong);
    box-shadow: var(--shadow-hard-hover);
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
  }

  .ant-modal-close {
    display: none;
  }
}
</style>
