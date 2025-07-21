import { api } from "./Http"
export default async function DownloadAndSaveFile(filename) {
    try {
        const response = await api.get(`util/download?filename=${encodeURIComponent(filename)}`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href=url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        alert("파일 다운로드 중 오류 발생.")
        console.log(error)
    }
}

export function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];

        // ✨ 한글 안 깨지게 처리
        const payload = decodeURIComponent(
            atob(base64Payload)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(payload);
    } catch (e) {
        console.error("JWT 파싱 오류", e);
        return null;
    }
}