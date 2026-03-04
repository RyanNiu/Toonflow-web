export default defineStore(
  "setting",
  () => {
    const currentURL = typeof window !== "undefined" ? window.location.origin : "http://localhost:60000";
    const defaultApiUrl =
      typeof window !== "undefined" && !window.location.host.includes("localhost")
        ? `${currentURL}/api` // 生产环境使用相对 Nginx 代理路径
        : "http://localhost:60000"; // 本地开发继续直连

    const baseUrl = ref<string>(defaultApiUrl);
    const wsBaseUrl = ref<string>(defaultApiUrl.replace("http", "ws"));

    const otherSetting = ref({
      axiosTimeOut: 60000 * 10 * 100,
      assetsBatchGenereateSize: 5,
    });

    const themeSetting = ref({
      mode: "light" as "light" | "dark" | "auto",
      primaryColor: "#9810fa",
    });

    return { baseUrl, wsBaseUrl, otherSetting, themeSetting };
  },
  { persist: true },
);
