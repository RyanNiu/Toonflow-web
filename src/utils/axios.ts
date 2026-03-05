import axios from "axios";
import router from "@/router/index";
import { message } from "ant-design-vue";
import { storeToRefs } from "pinia";
import settingStore from "@/stores/setting";

const instance = axios.create();

instance.interceptors.request.use(function (config) {
  const { baseUrl, otherSetting } = storeToRefs(settingStore());
  config.baseURL = baseUrl.value;
  config.timeout = otherSetting.value.axiosTimeOut;
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

instance.interceptors.response.use(
  function (response) {
    const token = localStorage.getItem("token");
    const { baseUrl } = storeToRefs(settingStore());
    const data = appendTokenToData(response.data, token, baseUrl.value);
    return data;
  },
  function (error) {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accountId");
      localStorage.removeItem("is_admin");
      router.push("/login");
      message.error("登录已过期，请重新登录");
    }
    return Promise.reject(error?.response?.data ?? error);
  }
);

function appendTokenToData(data: any, token: string | null, baseUrl: string): any {
  if (!token) return data;
  if (Array.isArray(data)) return data.map((item) => appendTokenToData(item, token, baseUrl));
  if (data && typeof data === "object") {
    const next: Record<string, any> = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
      next[key] = appendTokenToData(value, token, baseUrl);
    }
    return next;
  }
  if (typeof data === "string") {
    return appendTokenToUrl(data, token, baseUrl);
  }
  return data;
}

function appendTokenToUrl(url: string, token: string, baseUrl: string): string {
  try {
    if (!url.startsWith("http")) return url;
    const parsed = new URL(url);
    const baseParsed = new URL(baseUrl);
    if (parsed.origin !== baseParsed.origin) return url;
    if (parsed.searchParams.has("token")) return url;
    if (!/^\/(\d+)\//.test(parsed.pathname)) return url;
    parsed.searchParams.set("token", token.replace("Bearer ", ""));
    return parsed.toString();
  } catch {
    return url;
  }
}

export default instance;
