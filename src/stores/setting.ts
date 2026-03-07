export default defineStore(
  "setting",
  () => {
    // 自动检测当前浏览器访问的 hostname，如果在 electron 的 file:// 环境下 hostname 为空，则回退到 localhost
    const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";

    // 无论是本地还是线上，后端始终保持在 60000 端口
    const defaultApiUrl = `http://${hostname}:60000`;

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
