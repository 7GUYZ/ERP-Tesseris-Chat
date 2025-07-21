import { useNavigate, useParams } from "react-router-dom";
import "../../styles/guestbookdetail.css"
import UseForm from "../../components/hooks/UseForm";
import { UseLoadingError } from "../../components/hooks/UseLoadingError";
import {useEffect, useState } from "react";
import { GetGuestBookDetail, GuestBookDeleteOK, GuestBookUpdate } from "../../api/GuestBook";
import DownloadAndSaveFile from "../../api/Common";
export default function GuestBookDetail() {
    const [editmode, setEditmode] = useState(false);
    const { gb_idx } = useParams();
    const { form, setForm, handleChange, handleFileChange, resetForm } = UseForm({ gb_content: "", gb_subject: "", file: null });
    const { loading, error, uiStatus } = UseLoadingError();
    const [original, setOriginal] = useState();
    const navigate = useNavigate();
    const [guestbookdetail, setGuestbookdetail] = useState();
    useEffect(() => {
        const GuestBookDetailOK = async () => {
            try {
                uiStatus.start();
                const response = await GetGuestBookDetail(gb_idx);
                if (response.data.result) {
                    console.log(response.data.data)
                    setGuestbookdetail(response.data.data);
                    setOriginal(response.data.data);
                    setForm({
                        gb_subject: response.data.data.gb_subject,
                        gb_content: response.data.data.gb_content
                    })
                    uiStatus.stop();
                }
            }
            catch (error) {
                console.log(error)
                uiStatus.setError();
            } finally {
                uiStatus.stop();
            }
        }
        GuestBookDetailOK();
    }, []);
    // 3. 수정 취소시 form 롤백
    const handleCancel = () => {
        setEditmode(false);
        // form 초기화 (수정모드 아니면 guestbookdetail 보여줌)
        setForm({
            gb_subject: original?.gb_subject || "",
            gb_content: original?.gb_content || "",
            file: null,
        });
    };
    const handleSubmit = async (e) => {
        if (!editmode) return;
        try {
            const gb_pwd = prompt("비밀번호를 입력하세요.");
            if (!gb_pwd)return;
            const data = new FormData();
            const json = JSON.stringify({
                gb_idx: gb_idx,
                gb_name: guestbookdetail.gb_name,
                gb_regdate: guestbookdetail.gb_regdate.replace(" ", "T"),
                gb_subject: form.gb_subject,
                gb_content: form.gb_content,
                gb_pw: gb_pwd
            })
            data.append("data", new Blob([json], { type: "application/json" }))
            data.append("gb_f_name", form.file);
            const updateRes = await GuestBookUpdate(data);
            if (updateRes.data.result) {
                alert(updateRes.data.message);
                window.location.reload();
            } else {
                alert(updateRes.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const GuestBookDelete = async () => {
        const gb_pw = prompt("비밀번호를 입력하세요.");
        if (!gb_pw) return;
        try {
            const res = await GuestBookDeleteOK(gb_idx, gb_pw);
            if (res.data.result) {
                alert(res.data.message);
                navigate(`/guestbook`);
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("삭제중 오류가 발생 하였습니다.");
            navigate(`/guestbook`)
        }
    }
    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>로딩중...</div>
    if (error) return <div style={{ textAlign: "center", padding: "20px" }}>에러...</div>
    return (
        <div className="guestbook-detail-div">
            <div className="guestbook-detail-button">
                {editmode ? (
                    <>
                        <button type="button" onClick={() => handleSubmit()}>적용</button>
                        <button type="button" onClick={() => handleCancel()}>취소</button>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={() => setEditmode(true)}>수정</button>
                        <button type="button" onClick={() => GuestBookDelete()}>삭제</button>
                    </>
                )}
            </div>
            <button type="button" style={{ width: "100%", padding: "5px", margin: "10px auto", cursor: "pointer" }} onClick={() => navigate(`/guestbook`)}>목록으로 돌아가기</button>
            <form onSubmit={handleSubmit}>
                <label htmlFor="Author">Author</label>
                <input type="text" name="gb_name" id="Author" value={guestbookdetail?.gb_name || ""} readOnly />
                <label htmlFor="Subject">Subject</label>
                <input type="text" name="gb_subject" id="Subject" value={form.gb_subject} onChange={handleChange} readOnly={!editmode} required placeholder="제목을 입력해 주세요." />
                <label htmlFor="Content">Content</label>
                <input type="text" name="gb_content" id="Content" value={form.gb_content} onChange={handleChange} readOnly={!editmode} placeholder="내용을 입력해주세요." />
                <label htmlFor="regdate">Written Date</label>
                <input type="text" name="gb_regdate" id="regdate" value={guestbookdetail?.gb_regdate.substring(0, 16) || ""} readOnly />
                <hr style={{ width: "100%" }} />
                <label htmlFor="attachment">Attachment</label>
                {editmode ?
                    (<>
                        <input type="file" name="gb_f_name" id="attachment" onChange={handleFileChange} />
                    </>) : (<>
                        <input type="text" name="gb_f_name" id="attachment" value={guestbookdetail?.gb_f_name ? guestbookdetail.gb_f_name.substring(guestbookdetail.gb_f_name.indexOf("_") + 1) : "No - Attachment"} onClick={guestbookdetail?.gb_f_name ? () => DownloadAndSaveFile(guestbookdetail.gb_f_name) : undefined} style={{ cursor: guestbookdetail?.gb_f_name ? "pointer" : "default" }} readOnly />
                    </>)}
            </form>
        </div>
    );
}