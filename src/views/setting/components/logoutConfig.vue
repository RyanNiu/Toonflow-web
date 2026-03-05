<template>
  <div class="logout-config">
    <t-space direction="vertical" size="medium">
      <!-- <t-alert theme="warning" message="退出登录后，您需要重新登录才能继续使用系统。" /> -->
      <t-popconfirm content="确定要退出登录吗？" @confirm="handleLogout">
        <t-button theme="danger" :loading="loading">
          <template #icon>
            <t-icon name="logout" />
          </template>
          退出登录
        </t-button>
      </t-popconfirm>
    </t-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";
import userStore from "@/stores/user";
import { storeToRefs } from "pinia";

const router = useRouter();
const loading = ref(false);
const user = userStore();
const { token, accountId, isAdmin } = storeToRefs(user);

async function handleLogout() {
  loading.value = true;
  try {
    // 清除本地存储的token
    localStorage.removeItem("token");
    localStorage.removeItem("accountId");
    localStorage.removeItem("is_admin");
    // 清除其他可能的用户数据
    localStorage.removeItem("user");
    token.value = null;
    accountId.value = null;
    isAdmin.value = false;
    
    MessagePlugin.success("退出登录成功");
    
    // 跳转到登录页面
    router.push("/login");
  } catch (error) {
    MessagePlugin.error("退出登录失败，请重试");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.logout-config {
  padding: 10px 0;
}
</style>
