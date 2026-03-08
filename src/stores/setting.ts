export default defineStore(
  "setting",
  () => {
    // 开发时前端在 9999，用当前 origin 走 Vite 代理到后端 60000；否则用 hostname:60000
    const isDevProxy =
      typeof window !== "undefined" &&
      window.location.port === "9999" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const defaultApiUrl =
      isDevProxy ? `${window.location.origin}` : `http://${typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost"}:60000`;

    const baseUrl = ref<string>(defaultApiUrl);
    const wsBaseUrl = ref<string>(defaultApiUrl.replace("http", "ws"));

    const otherSetting = ref({
      axiosTimeOut: 60000 * 10 * 100,
      assetsBatchGenereateSize: 5,
    });

    const themeSetting = ref({
      mode: "light" as "light" | "dark" | "auto",
      primaryColor: "#2b6fdc",
    });

    return { baseUrl, wsBaseUrl, otherSetting, themeSetting };
  },
  { persist: true },
);
