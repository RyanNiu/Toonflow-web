<template>
  <div class="overviewMain">
    <!-- 头部 -->
    <div class="overviewHeader">
      <h2 class="overviewTitle">小说原文</h2>
      <p class="overviewSub">查看小说原文</p>
    </div>

    <!-- 操作栏 -->
    <t-card :bordered="false" class="summaryCard">
      <div class="jb ac">
        <div class="f ac">
          <i-file-text :size="24" class="summaryIcon mr-3" />
          <span class="summaryTitle">原文管理</span>
        </div>
        <t-button theme="primary" variant="outline" @click="purgeNovelShow = true">
          <template #icon><i-optimize :size="16" /></template>
          新增
        </t-button>
      </div>
    </t-card>

    <!-- 表格 -->
    <t-table :data="originalList" :columns="columns" row-key="id" hover max-height="500" style="margin-top: 12px">
      <template #chapterData="{ row }">
        <t-tooltip :content="row.chapterData" placement="top">
          <span class="ellipsis-text">{{ row.chapterData }}</span>
        </t-tooltip>
      </template>
      <template #operation="{ row }">
        <div class="actionBtns">
          <t-link theme="primary" hover="color" @click="handleEdit(row)">
            <i-edit size="18" />
          </t-link>
          <t-popconfirm content="确定要删除吗？" @confirm="handleDelete(row)">
            <t-link theme="danger" hover="color">
              <i-delete size="18" />
            </t-link>
          </t-popconfirm>
        </div>
      </template>
    </t-table>

    <!-- 新增弹窗 -->
    <purgeNovel v-model="purgeNovelShow" @select="handleAddChapters" />

    <!-- 编辑弹窗 -->
    <t-dialog placement="center" v-model:visible="editModal" header="编辑原文" width="60vw" @confirm="handleUpdate">
      <div class="editModalContent">
        <t-form :data="formData" layout="vertical">
          <t-form-item label="章" name="index">
            <t-input-number v-model="formData.index" theme="normal" style="width: 100%" />
          </t-form-item>
          <t-form-item label="卷" name="reel">
            <t-input v-model="formData.reel" />
          </t-form-item>
          <t-form-item label="章节名称" name="chapter">
            <t-input v-model="formData.chapter" />
          </t-form-item>
          <t-form-item label="章节内容" name="chapterData">
            <t-textarea v-model="formData.chapterData" :autosize="{ minRows: 5, maxRows: 20 }" />
          </t-form-item>
        </t-form>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from "tdesign-vue-next";
import axios from "@/utils/axios";
import purgeNovel from "./components/purgeNovel.vue";
import store from "@/stores";
const { projectId } = storeToRefs(store());

interface OriginalText {
  id: number;
  index: number;
  reel: string;
  chapter: string;
  chapterData: string;
}

interface ChapterItem {
  index: number;
  reel: string;
  chapter: string;
  chapterData: string;
}

const columns = [
  { colKey: "index", title: "章", width: 100 },
  { colKey: "reel", title: "卷", width: 100 },
  { colKey: "chapter", title: "章节名称", width: 200, ellipsis: true },
  { colKey: "chapterData", title: "章节内容", ellipsis: true },
  { colKey: "operation", title: "操作", width: 100 },
];

const originalList = ref<OriginalText[]>([]);
const purgeNovelShow = ref(false);
const editModal = ref(false);
const formData = ref<OriginalText>({ id: -1, index: 0, reel: "", chapter: "", chapterData: "" });

// 获取小说列表
const getNovel = () => {
  axios.post("/novel/getNovel", { projectId: projectId.value }).then((res) => {
    originalList.value = res.data;
  });
};

// 新增章节
const handleAddChapters = (chapters: ChapterItem[]) => {
  axios.post("/novel/addNovel", { projectId: projectId.value, data: chapters }).then(() => {
    getNovel();
    purgeNovelShow.value = false;
  });
};

// 编辑
const handleEdit = (row: OriginalText) => {
  formData.value = { ...row };
  editModal.value = true;
};

// 更新
const handleUpdate = () => {
  axios.post("/novel/updateNovel", formData.value).then(() => {
    getNovel();
    MessagePlugin.success("更新成功");
    editModal.value = false;
  });
};

// 删除
const handleDelete = (row: OriginalText) => {
  axios.post("/novel/delNovel", { id: row.id }).then(() => {
    getNovel();
  });
};

onMounted(getNovel);
</script>

<style lang="scss" scoped>
.overviewHeader {
  margin-bottom: 32px;
  padding: 18px 22px;
  background: var(--color-surface);
  border: var(--border-width-strong) solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);
  .overviewTitle {
    font-size: 24px;
    font-weight: 800;
    color: var(--color-text);
    margin-bottom: 8px;
  }
  .overviewSub {
    color: var(--color-text-muted);
    font-weight: 600;
  }
}

.summaryCard {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: var(--border-width-strong) solid var(--color-border-strong);
  box-shadow: var(--shadow-hard);

  .summaryIcon {
    color: var(--color-accent);
  }
  .summaryTitle {
    font-weight: 800;
    color: var(--color-text);
    font-size: 1rem;
  }
}

.actionBtns {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 8px;
}

:deep(.t-table) {
  border: var(--border-width-strong) solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard);
  overflow: hidden;
}

:deep(.t-table__header) {
  background: var(--color-surface-alt);
  font-weight: 800;
}

:deep(.t-table__row:hover) {
  background: var(--color-accent-soft);
}

.ellipsis-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}

.editModalContent {
  max-height: 700px;
  overflow-y: auto;
}
</style>
