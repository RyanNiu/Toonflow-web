<template>
  <a-modal
    v-model:open="modelValue"
    width="60vw"
    :closable="false"
    :maskClosable="false"
    wrapClassName="no-header-margin"
    dialogClass="custom-modal"
    :afterClose="handleClose">
    <!-- 标题栏 -->
    <template #title>
      <a-flex justify="space-between" align="center" class="modal-header">
        <a-typography-title :level="4" style="margin: 0">镜头编辑器</a-typography-title>
        <a-button type="text" @click="closeModal">
          <template #icon>
            <i-close theme="outline" size="18" fill="var(--color-primary)" />
          </template>
        </a-button>
      </a-flex>
    </template>

    <a-flex class="modal-content">
      <!-- 左侧面板 -->
      <a-flex v-if="mode === 'manual'" vertical gap="middle" class="left-panel">
        <!-- 镜头图区域 -->
        <a-card title="镜头图" :bordered="false" size="small">
          <a-row :gutter="[12, 12]">
            <a-col :span="6">
              <div class="image-card-wrapper">
                <a-image :src="mockStoryboard.filePath || ''" :fallback="errorPictrue" class="scene-image" />
                <a-tag color="cyan" class="image-tag">图 1</a-tag>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="upload-card" @click="lensImage">
                <i-upload-picture theme="outline" size="36" fill="var(--color-primary)" />
              </div>
            </a-col>
          </a-row>
        </a-card>

        <!-- 其他图片区域 -->
        <a-card title="其他" :bordered="false" size="small">
          <a-row :gutter="[12, 12]">
            <a-col :span="6" v-for="(item, index) in mockStoryboard.otherImgs" :key="index">
              <div class="image-card-wrapper">
                <a-image :preview="false" :src="item.filePath || ''" :fallback="errorPictrue" class="scene-image" />
                <div class="image-actions">
                  <a-button type="text" size="small" danger @click.stop="delOtherImgs(index)">
                    <template #icon>
                      <i-close-one theme="outline" size="16" fill="var(--color-error)" />
                    </template>
                  </a-button>
                  <a-button v-if="item.filePath" type="text" size="small" @click.stop="startPreview(item.filePath)">
                    <template #icon>
                      <i-preview-open theme="outline" size="16" fill="var(--color-primary)" />
                    </template>
                  </a-button>
                </div>
                <a-tag color="cyan" class="image-tag">图 {{ index + 2 }}</a-tag>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="upload-card" @click="handleSelectOtherImgs">
                <i-upload-picture theme="outline" size="36" fill="var(--color-primary)" />
              </div>
            </a-col>
          </a-row>
        </a-card>

        <!-- 编辑指令区域 -->
        <a-card title="编辑指令" :bordered="false" size="small">
          <a-mentions
            ref="mentionRef"
            v-model:value="mockStoryboard.editPrompt"
            :rows="3"
            placeholder="请输入编辑指令，您可以通过@来引用其他图像或资产（如@沈辞）"
            :options="options"
            @blur="onEditBlur" />
          <!-- 关联资产标签：展示本集关联资产，选中后生成图时会带上该资产的图片地址 -->
          <div class="asset-tags-section">
            <div class="asset-tags-label">关联资产</div>
            <div class="asset-tags-list">
              <a-tag
                v-for="asset in assetList"
                :key="asset.id"
                :color="selectedAssetIds.includes(asset.id) ? 'blue' : 'default'"
                class="asset-tag"
                @click="toggleAsset(asset)">
                {{ asset.name }}
              </a-tag>
              <span v-if="!assetList.length" class="asset-tags-empty">暂无关联资产，请先在资产管理中关联到本集或使用项目级资产</span>
            </div>
          </div>
          <a-button type="primary" block style="margin-top: 12px" :loading="generateLoading" @click="doMerge">生成图片</a-button>
        </a-card>
      </a-flex>

      <a-divider v-if="mode === 'manual'" type="vertical" style="height: 100%" />

      <!-- 中间面板 - 生成结果 -->
      <a-flex vertical class="middle-panel">
        <a-card title="镜头提示词" :bordered="false" size="small" style="margin-bottom: 20px" v-if="mockStoryboard.prompt">
          {{ mockStoryboard.prompt }}
        </a-card>
        <a-card title="生成结果" :bordered="false" size="small">
          <template v-if="mockStoryboard.generateImg && mockStoryboard.generateImg.length > 0">
            <a-row :gutter="[12, 12]">
              <a-col :span="8" v-for="(item, index) in mockStoryboard.generateImg" :key="index">
                <div :class="['image-card-wrapper', { 'image-selected': resultSelectedIndex === index }]" @click="resultSelectedIndex = index">
                  <a-image :preview="false" :src="item.filePath || ''" :fallback="errorPictrue" class="scene-image" />
                  <div class="image-actions">
                    <a-popconfirm title="确定要删除这张图片吗？" ok-text="确定" cancel-text="取消" @confirm="delResult(index)">
                      <a-button type="text" size="small" danger @click.stop>
                        <template #icon>
                          <i-close-one theme="outline" size="16" fill="var(--color-error)" />
                        </template>
                      </a-button>
                    </a-popconfirm>
                    <a-button v-if="item.filePath" type="text" size="small" @click.stop="startPreview(item.filePath)">
                      <template #icon>
                        <i-preview-open theme="outline" size="16" fill="var(--color-primary)" />
                      </template>
                    </a-button>
                  </div>
                  <div v-if="resultSelectedIndex === index" class="selected-overlay">
                    <i-check theme="outline" size="70" fill="var(--color-success)" strokeLinejoin="bevel" />
                  </div>
                </div>
              </a-col>
            </a-row>
          </template>
          <a-empty v-else description="请先生成图片" />
        </a-card>
      </a-flex>
    </a-flex>

    <!-- 底部按钮 -->
    <template #footer>
      <a-flex justify="end" gap="middle" class="modal-footer">
        <a-button size="large" @click="closeModal">取消</a-button>
        <a-button size="large" type="primary" @click="handleSaveFirstFrame">保存</a-button>
      </a-flex>
    </template>
  </a-modal>

  <!-- 图片预览 -->
  <a-image
    :width="200"
    :style="{ display: 'none' }"
    :preview="{
      visible: imagePreviewVisiable,
      onVisibleChange: setPreviewVisible,
    }"
    :src="previewImageUrl || ''" />

  <!-- 素材选择弹窗 -->
  <a-modal v-model:open="selectElementModal" width="60%" :closable="false" @ok="handleSelectElementOk" @cancel="handleSelectElementCancel">
    <div style="height: 700px; overflow-y: auto">
      <mainElement way="radio" ref="mainElementRef" v-if="selectElementModal" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
import { ref, computed, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { message } from "ant-design-vue";
import mainElement from "@/views/projectDetail/components/assetsManager/components/mainElement.vue";
import store from "@/stores";
import errorPictrue from "@/utils/error";
import axios from "@/utils/axios";

interface OtherImg {
  id: number;
  filePath: string;
}

interface GenerateImg {
  id?: number;
  filePath: string;
}

interface Storyboard {
  id: number;
  filePath: string;
  scriptId?: number;
  otherImgs: OtherImg[];
  prompt: string;
  editPrompt: string;
  intro: string;
  generateImg: GenerateImg[];
}

withDefaults(
  defineProps<{
    generateImage?: (imageList: string[], intro: string, id: number) => Promise<string>;
    generatePrompt?: (id: number) => Promise<string>;
  }>(),
  {
    generateImage: async () => "",
    generatePrompt: async () => "生成提示词",
  },
);

const emit = defineEmits<{
  save: [data: { id: number; filePath: string; prompt: string }];
}>();

const { projectId } = storeToRefs(store());

// 使用组件内部状态，确保每个弹窗实例独立
const generateLoading = ref(false);

const modelValue = ref(false);
const mode = ref("manual");
const selectElementModal = ref(false);
const mainElementRef = ref<InstanceType<typeof mainElement> | null>(null);
const componentResolve = ref<((value: { id: number; filePath: string }) => void) | null>(null);
const resultSelectedIndex = ref(-1);
const previewImageUrl = ref("");
const imagePreviewVisiable = ref(false);

// 监听弹窗打开，重置加载状态并拉取资产列表
watch(modelValue, (visible) => {
  if (visible) {
    generateLoading.value = false;
    fetchAssets();
  }
});

const mockStoryboard = ref<Storyboard>({
  id: -1,
  filePath: "",
  otherImgs: [],
  prompt: "",
  editPrompt: "",
  intro: "",
  generateImg: [],
});

/** 资产列表（角色、场景、道具），用于标签展示与 @提及 时带图 */
interface AssetItem {
  id: number;
  name: string;
  type: string;
  filePath?: string;
}
const assetList = ref<AssetItem[]>([]);
const selectedAssetIds = ref<number[]>([]);
const mentionRef = ref<any>(null);
/** 编辑指令输入框光标位置，用于在光标处插入 @标签 */
const editCursor = ref({ start: 0, end: 0 });

function onEditBlur(e: FocusEvent) {
  const t = (e.target as HTMLTextAreaElement);
  if (t?.tagName === "TEXTAREA" && typeof t.selectionStart === "number") {
    editCursor.value = { start: t.selectionStart, end: t.selectionEnd };
  }
}

async function fetchAssets() {
  if (!projectId.value) return;
  const scriptId = mockStoryboard.value.scriptId;
  const types = ["角色", "场景", "道具"] as const;
  const list: AssetItem[] = [];
  for (const type of types) {
    try {
      const res = await axios.post("/assets/getAssets", {
        projectId: projectId.value,
        type,
        ...(scriptId != null && scriptId > 0 ? { scriptId } : {}),
      });
      const data = res?.data ?? res;
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      arr.forEach((item: any) => {
        if (item.id != null && item.name) list.push({ id: item.id, name: item.name, type: item.type || type, filePath: item.filePath });
      });
    } catch {
      // ignore
    }
  }
  assetList.value = list;
}

function toggleAsset(asset: AssetItem) {
  const idx = selectedAssetIds.value.indexOf(asset.id);
  if (idx === -1) {
    selectedAssetIds.value = [...selectedAssetIds.value, asset.id];
    const insertText = `@${asset.name} `;
    const cur = mockStoryboard.value.editPrompt ?? "";
    const { start, end } = editCursor.value;
    const clampedStart = Math.max(0, Math.min(start, cur.length));
    const clampedEnd = Math.max(clampedStart, Math.min(end, cur.length));
    mockStoryboard.value.editPrompt = cur.slice(0, clampedStart) + insertText + cur.slice(clampedEnd);
    const newCursor = clampedStart + insertText.length;
    editCursor.value = { start: newCursor, end: newCursor };
    nextTick(() => {
      const ta = mentionRef.value?.$el?.querySelector?.("textarea");
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor);
      }
    });
  } else {
    selectedAssetIds.value = selectedAssetIds.value.filter((id) => id !== asset.id);
  }
}

const options = computed(() => {
  const result: { value: string; label: string }[] = [];
  let index = 1;
  if (mockStoryboard.value.filePath) {
    result.push({ value: `图${index}`, label: `图${index}` });
    index++;
  }
  mockStoryboard.value.otherImgs?.forEach(() => {
    result.push({ value: `图${index}`, label: `图${index}` });
    index++;
  });
  assetList.value.forEach((a) => {
    result.push({ value: a.name, label: a.name });
  });
  return result;
});

// 输入框中 @资产名 时，自动选中对应资产标签
watch(
  () => mockStoryboard.value.editPrompt,
  (prompt) => {
    if (!prompt || !assetList.value.length) return;
    const atRegex = /@[\u4e00-\u9fa5\w]+/g;
    const matches = prompt.match(atRegex) || [];
    const toAdd: number[] = [];
    for (const m of matches) {
      const name = m.slice(1);
      const asset = assetList.value.find((a) => a.name === name);
      if (asset && !selectedAssetIds.value.includes(asset.id)) toAdd.push(asset.id);
    }
    if (toAdd.length) selectedAssetIds.value = [...selectedAssetIds.value, ...toAdd];
  },
  { flush: "sync" },
);

function setPreviewVisible(value: boolean): void {
  imagePreviewVisiable.value = value;
}

function startPreview(imageUrl: string): void {
  previewImageUrl.value = imageUrl;
  setPreviewVisible(true);
}
// 文件选择
const { open, onChange, onCancel } = useFileDialog({ multiple: false, reset: true, accept: ".png,.jpg,.jpeg" });
// 文件选择
async function lensImage() {
  const files = await new Promise<FileList | null>((resolve) => {
    open();
    onChange((f) => resolve(f));
    onCancel(() => resolve(null));
  });

  if (!files?.length) return;

  const file = files[0];
  //转成base64显示
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    mockStoryboard.value.filePath = base64;
  };
  reader.readAsDataURL(file);
  // mockStoryboard.value.id = -1; // 新上传的图片没有id，使用-1标识，后端根据filePath处理这种情况
}

async function handleSelectOtherImgs(): Promise<void> {
  selectElementModal.value = true;
  try {
    const res = await new Promise<{ id: number; filePath: string }>((resolve) => {
      componentResolve.value = resolve;
    });
    mockStoryboard.value.otherImgs.push({ id: res.id, filePath: res.filePath });
  } catch {
    // 用户取消
  }
}

function handleSelectElementCancel(): void {
  componentResolve.value = null;
}

function handleSelectElementOk(): void {
  if (mainElementRef.value && componentResolve.value) {
    const res = mainElementRef.value.getSelectData();
    componentResolve.value(res);
    selectElementModal.value = false;
    componentResolve.value = null;
  }
}

function delOtherImgs(index: number): void {
  mockStoryboard.value.otherImgs.splice(index, 1);
}

function delResult(index: number): void {
  mockStoryboard.value.generateImg.splice(index, 1);
  if (resultSelectedIndex.value >= mockStoryboard.value.generateImg.length) {
    resultSelectedIndex.value = mockStoryboard.value.generateImg.length - 1;
  }
}
function isBase64Image(str: string): boolean {
  // 通用图片类型
  const reg = /^data:image\/(jpeg|jpg|png|gif|bmp|webp|svg\+xml);base64,/i;
  return reg.test(str);
}
async function doMerge(): Promise<void> {
  generateLoading.value = true;

  if (mockStoryboard.value.editPrompt.length < 5) {
    message.error("编辑指令必须大于5个字");
    generateLoading.value = false;
    return;
  }
  const filePathMap: Record<string, number | string> = {
    "@图1":
      !isBase64Image(mockStoryboard.value.filePath) && mockStoryboard.value.id && mockStoryboard.value.id !== -1
        ? mockStoryboard.value.id
        : mockStoryboard.value.filePath,
  };

  mockStoryboard.value.otherImgs.forEach((item, idx) => {
    filePathMap[`@图${idx + 2}`] = item.id;
  });
  selectedAssetIds.value.forEach((id) => {
    const asset = assetList.value.find((a) => a.id === id);
    if (asset?.name) filePathMap[`@${asset.name}`] = id;
  });
  try {
    const payload: Record<string, unknown> = {
      filePath: filePathMap,
      prompt: mockStoryboard.value.editPrompt,
      projectId: projectId.value,
    };
    if (mockStoryboard.value.id != null && mockStoryboard.value.id > 0) {
      payload.assetsId = mockStoryboard.value.id;
    }
    const res = await axios.post("/storyboard/generateStoryboardApi", payload);
    const url = res?.data?.url ?? res?.url;
    if (!url) {
      message.error("生成成功但未返回图片地址");
      return;
    }
    mockStoryboard.value.generateImg.push({
      filePath: url,
      id: res?.data?.id ?? undefined,
    });
    message.success("图片生成成功");
  } catch (e: any) {
    const msg = e?.message ?? e?.data?.message ?? "生成图片失败，请重试";
    message.error(msg);
  } finally {
    generateLoading.value = false;
  }
}

function doFusionEdit(storyboard: Storyboard): void {
  mockStoryboard.value = JSON.parse(JSON.stringify(storyboard));
  mockStoryboard.value.generateImg = [{ filePath: mockStoryboard.value.filePath }, ...(mockStoryboard.value.generateImg || [])];
  resultSelectedIndex.value = mockStoryboard.value.generateImg.findIndex((item) => item.filePath === storyboard.filePath);
  modelValue.value = true;
}

function handleSaveFirstFrame(): void {
  if (resultSelectedIndex.value < 0 || !mockStoryboard.value.generateImg[resultSelectedIndex.value]) {
    message.warning("请先选择一张图片");
    return;
  }

  emit("save", {
    id: mockStoryboard.value.id,
    filePath: mockStoryboard.value.generateImg[resultSelectedIndex.value].filePath,
    prompt: mockStoryboard.value.prompt,
  });
  modelValue.value = false;
}

function handleClose(): void {
  resultSelectedIndex.value = -1;
}
function closeModal(): void {
  modelValue.value = false;
}

defineExpose({
  doFusionEdit,
});
</script>

<style lang="scss" scoped>
.modal-header {
  background: var(--color-surface-paper);
  height: 60px;
  padding: 0 24px;
}

.modal-content {
  height: 70vh;
  background: var(--color-surface-soft);
  min-width: 800px;
}

.asset-tags-section {
  margin-top: 12px;
  .asset-tags-label {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }
  .asset-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-height: 28px;
  }
  .asset-tag {
    cursor: pointer;
    user-select: none;
  }
  .asset-tags-empty {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.left-panel,
.middle-panel {
  flex: 1;
  padding: 12px 6px;
  overflow-y: auto;
  box-sizing: border-box;
}

.image-card-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  cursor: pointer;
  background: var(--color-surface-alt);
  text-align: center;
  &:hover {
    border-color: var(--color-primary);

    .image-actions {
      opacity: 1;
    }
  }
}

.scene-image {
  width: 100%;
  height: 100% !important;
}

.image-tag {
  position: absolute;
  right: 4px;
  bottom: 4px;
  margin: 0;
}

.image-actions {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.2s;
  background: transparent;
  border-radius: 4px;
  padding: 2px;

  .ant-btn {
    background: rgba(var(--color-surface-rgb), 0.9);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(var(--color-ink-rgb), 0.12);

    &:hover {
      background: rgba(var(--color-surface-rgb), 1);
    }
  }
}

.upload-card {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  background: var(--color-surface-alt);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }
}

.image-selected {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--color-ink-rgb), 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  padding: 16px;
}

:deep(.ant-card-head) {
  min-height: auto;
  padding: 8px 12px;

  .ant-card-head-title {
    font-size: 14px;
    font-weight: 600;
    padding: 0;
  }
}

:deep(.ant-card-body) {
  padding: 12px;
}
:deep(.ant-image) {
  height: 100% !important;
  img {
    height: 100% !important;
    object-fit: cover;
  }
}
</style>
