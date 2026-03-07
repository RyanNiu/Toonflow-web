<template>
  <div class="accountManage">
    <div class="header">
      <div>
        <h2 class="title">账号管理</h2>
        <p class="subtitle">管理员可新增/删除账号并重置密码</p>
      </div>
      <t-button theme="primary" @click="openAddDialog">新增账号</t-button>
    </div>

    <t-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      row-key="id"
      bordered
      size="medium">
      <template #is_admin="{ row }">
        <t-tag :theme="row.is_admin ? 'primary' : 'default'" variant="light">
          {{ row.is_admin ? "管理员" : "普通账号" }}
        </t-tag>
      </template>
      <template #operation="{ row }">
        <div class="op">
          <t-button
            size="small"
            :theme="row.is_admin ? 'default' : 'primary'"
            variant="outline"
            :disabled="row.id === 1"
            @click="handleRoleChange(row)">
            {{ row.is_admin ? "设为普通" : "设为管理员" }}
          </t-button>
          <t-button size="small" theme="primary" variant="outline" @click="openResetDialog(row)">
            重置密码
          </t-button>
          <t-popconfirm content="确定删除该账号吗？" @confirm="handleDelete(row)">
            <t-button size="small" theme="danger" variant="outline" :disabled="row.id === 1">
              删除
            </t-button>
          </t-popconfirm>
        </div>
      </template>
    </t-table>

    <t-dialog v-model:visible="addDialogVisible" header="新增账号" :confirm-btn="{ content: '创建' }" @confirm="handleAdd">
      <t-form :data="addForm" :rules="addRules" ref="addFormRef" labelAlign="top">
        <t-form-item label="用户名" name="name">
          <t-input v-model="addForm.name" placeholder="请输入账号" />
        </t-form-item>
        <t-form-item label="密码" name="password">
          <t-input v-model="addForm.password" type="password" placeholder="请输入初始密码" />
        </t-form-item>
        <t-form-item label="管理员" name="is_admin">
          <t-switch v-model="addForm.is_admin" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <t-dialog v-model:visible="resetDialogVisible" header="重置密码" :confirm-btn="{ content: '重置' }" @confirm="handleReset">
      <t-form :data="resetForm" :rules="resetRules" ref="resetFormRef" labelAlign="top">
        <t-form-item label="新密码" name="password">
          <t-input v-model="resetForm.password" type="password" placeholder="请输入新密码" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { FormInstanceFunctions, FormRules, PrimaryTableCol } from "tdesign-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import axios from "@/utils/axios";

interface UserItem {
  id: number;
  name: string;
  is_admin: number | boolean;
  deleted_at?: number | null;
}

const loading = ref(false);
const tableData = ref<UserItem[]>([]);

const columns: Array<PrimaryTableCol<UserItem>> = [
  { colKey: "id", title: "ID", width: 80 },
  { colKey: "name", title: "用户名" },
  {
    colKey: "is_admin",
    title: "角色",
  },
  {
    colKey: "operation",
    title: "操作",
    width: 220,
  },
];

const addDialogVisible = ref(false);
const addFormRef = ref<FormInstanceFunctions | null>(null);
const addForm = ref({ name: "", password: "", is_admin: false });
const addRules: FormRules = {
  name: [{ required: true, message: "请输入用户名" }],
  password: [{ required: true, message: "请输入密码" }],
};

const resetDialogVisible = ref(false);
const resetFormRef = ref<FormInstanceFunctions | null>(null);
const resetForm = ref({ id: 0, password: "" });
const resetRules: FormRules = {
  password: [{ required: true, message: "请输入新密码" }],
};

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await axios.post("/user/listUsers");
    tableData.value = res.data || [];
  } catch (error: any) {
    MessagePlugin.error(error?.message || "获取账号列表失败");
  } finally {
    loading.value = false;
  }
}

function openAddDialog() {
  addForm.value = { name: "", password: "", is_admin: false };
  addDialogVisible.value = true;
}

async function handleAdd() {
  const result = await addFormRef.value?.validate();
  if (result !== true) return;
  try {
    await axios.post("/user/addUser", {
      name: addForm.value.name,
      password: addForm.value.password,
      is_admin: addForm.value.is_admin ? 1 : 0,
    });
    MessagePlugin.success("创建成功");
    addDialogVisible.value = false;
    fetchUsers();
  } catch (error: any) {
    MessagePlugin.error(error?.message || "创建失败");
  }
}

function openResetDialog(row: UserItem) {
  resetForm.value = { id: row.id, password: "" };
  resetDialogVisible.value = true;
}

async function handleReset() {
  const result = await resetFormRef.value?.validate();
  if (result !== true) return;
  try {
    await axios.post("/user/resetPassword", {
      id: resetForm.value.id,
      password: resetForm.value.password,
    });
    MessagePlugin.success("重置成功");
    resetDialogVisible.value = false;
  } catch (error: any) {
    MessagePlugin.error(error?.message || "重置失败");
  }
}

async function handleDelete(row: UserItem) {
  if (row.id === 1) return;
  try {
    await axios.post("/user/deleteUser", { id: row.id });
    MessagePlugin.success("删除成功");
    fetchUsers();
  } catch (error: any) {
    MessagePlugin.error(error?.message || "删除失败");
  }
}

async function handleRoleChange(row: UserItem) {
  if (row.id === 1) return;
  try {
    await axios.post("/user/updateRole", { id: row.id, is_admin: row.is_admin ? 0 : 1 });
    MessagePlugin.success("角色更新成功");
    fetchUsers();
  } catch (error: any) {
    MessagePlugin.error(error?.message || "角色更新失败");
  }
}

onMounted(fetchUsers);
</script>

<style lang="scss" scoped>
.accountManage {
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  background: transparent;
}

.header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.op {
  display: flex;
  gap: 8px;
}
</style>
