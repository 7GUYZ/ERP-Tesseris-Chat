import { api } from "./Http"
export const GetGuestBookList = () => api.get("guestbook/guestbooklist");
export const GuestBookInsertOK = (formdata) => api.post("guestbook/guestbookinsert", formdata, { headers: { "Content-Type": "multipart/form-data" } });
export const GetGuestBookDetail = (gb_idx) => api.get("guestbook/guestbookdetail", { params: { gb_idx } });
export const GuestBookUpdate = (formdata) => api.post("guestbook/guestbookupdate", formdata, { headers: { "Content-Type": "multipart/form-data" } });
export const GuestBookDeleteOK = (gb_idx, gb_pw) => api.post("guestbook/guestbookdelete", { gb_idx, gb_pw });