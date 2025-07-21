import { api } from "./Http"
export const GetBbsList = (page = 0) => api.get(`bbs/bbslist?page=${page}`);
export const BbsInsertOK = (formdata) => api.post("bbs/bbsinsert", formdata, { headers: { "Content-Type": "multipart/form-data" } });
export const GetBbsDetailOK = (b_idx) => api.get("bbs/bbsdetail", { params: { b_idx } });
export const BbsDetailDeleteOK = (b_idx, pwd) => api.post("bbs/bbsdetaildelete", { b_idx, pwd });
export const BbsDetailUpdate = (formdata) => api.post("bbs/bbsdetailupdate", formdata, { headers: { "Content-Type": "multipart/form-data" } });
export const RepleUpdate = (c_idx,editcontent) => api.post("bbs/bbsrepleupdate", {c_idx,editcontent});
export const RepleDelete = (c_idx) => api.post("bbs/bbsrepledelete", c_idx);
export const RepleOK = (formdata) => api.post("bbs/bbsreple",formdata, {headers: {"Content-Type": "multipart/form-data"}});
