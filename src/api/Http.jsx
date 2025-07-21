import axios from "axios";
export const makeupapi = axios.create({
    baseURL: process.env.REACT_APP_MAKEUP_API_BASE_URL,
    headers: { "Content-Type": "application/json" }
});

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

/** interceptors */
/** 요청에대한 인터셉터 빽으로 갈때마다 담아서 감 */
api.interceptors.request.use(
    (config) => {
        const excludePaths = ["members/login", "members/signup"];
        if (!excludePaths.includes(config.url)) {
            const tokens = localStorage.getItem("tokens");
            if (tokens) {
                const accessToken = JSON.parse(tokens).accessToken;
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/** 응답에 대한 인터셉터 빽에서 올 때 가로채서 먼저 받기 */
api.interceptors.response.use(res => res,
    async (error) => {
        const { config, response } = error;
        if (response?.status === 401 && !config._retry) {
            config._retry = true;
            try {
                const tokens = JSON.parse(localStorage.getItem("tokens"));
                const result = await api.post("members/refresh", { refreshToken: tokens.refreshToken }, { headers: {} });
                const { accessToken, refreshToken } = result.data.data;
                localStorage.setItem("tokens", JSON.stringify({ accessToken, refreshToken }));
                config.headers.Authorization = `Bearer ${accessToken}`;
                return api(config);
            } catch (error) {
                document.cookie = "snsProvider=; path=/; max-age=0";
                document.cookie = "authToken=; path=/; max-age=0";
                localStorage.removeItem("tokens");
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)
