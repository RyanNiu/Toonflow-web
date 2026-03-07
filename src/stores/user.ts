export default defineStore(
  "user",
  () => {
    const token = ref<string | null>(localStorage.getItem("token"));
    const accountId = ref<string | null>(localStorage.getItem("accountId"));
    const isAdmin = ref<boolean>(["1", "true"].includes(localStorage.getItem("is_admin") || ""));

    function syncFromStorage() {
      token.value = localStorage.getItem("token");
      accountId.value = localStorage.getItem("accountId");
      isAdmin.value = ["1", "true"].includes(localStorage.getItem("is_admin") || "");
    }

    return { token, accountId, isAdmin, syncFromStorage };
  },
  { persist: true },
);
