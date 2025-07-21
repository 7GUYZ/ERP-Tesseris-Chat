import { api } from "./Http"
export const login = (m_id, m_pw) => api.post("members/login", { m_id, m_pw });
export const logout = () => api.post("members/logout");
export const getmypage = () => api.get("members/mypage");