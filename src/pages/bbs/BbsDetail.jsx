import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BbsDetailDeleteOK, BbsDetailUpdate, GetBbsDetailOK, RepleDelete, RepleOK, RepleUpdate } from "../../api/Bbs";
import { UseLoadingError } from "../../components/hooks/UseLoadingError";
import UseForm from "../../components/hooks/UseForm";
import DownloadAndSaveFile, { parseJwt } from "../../api/Common";
import TiptapEditor from "../../components/TipTap";
import "../../styles/bbsdetail.css"

export default function BbsDetail() {
    const { form, setForm, handleChange, handleFileChange, resetForm } = UseForm({ subject: "", content: "", file: null });
    const [editmode, setEditmode] = useState(false);
    const [repleeditmode, setRepleeditmode] = useState(false);
    const { b_idx, cPage } = useParams();
    const { loading, error, uiStatus } = UseLoadingError();
    const [original, setOriginal] = useState();
    const navigate = useNavigate();
    const [bbsdetail, setBbsdetail] = useState();
    const [bbsdetailreple, setBbsdetailreple] = useState([]);
    const decoded = parseJwt(JSON.parse(localStorage.getItem("tokens"))?.accessToken);
    const [editContent, setEditContent] = useState("");
    useEffect(() => {
        const GetBbsDetail = async () => {
            try {
                uiStatus.start();
                const response = await GetBbsDetailOK(b_idx);
                if (response.data.result) {
                    setBbsdetail(response.data.data);
                    setBbsdetailreple(response.data.data.comments);
                    setOriginal(response.data.data);
                    setForm({
                        writer: response.data.data.writer,
                        subject: response.data.data.subject,
                        content: response.data.data.content
                    })
                } else {
                    alert(response.data.message)
                }
                uiStatus.stop();
                uiStatus.reset();
            } catch (error) {
                console.log(error);
            }
        }
        GetBbsDetail();
    }, []);
    const handleCancel = () => {
        setEditmode(false);
        setForm({
            subject: original.subject,
            content: original.content,
            f_name: original.f_name
        })
    }
    const BbsDetailDelete = async () => {
        const pwd = prompt("비밀번호를 입력해주세요");
        if (!pwd) return;
        const res = await BbsDetailDeleteOK(b_idx, pwd)
        if (res.data.result) {
            alert(res.data.message);
            navigate(`/bbs`)
        } else {
            alert(res.data.message);
        }
    }
    const handleSubmit = async () => {
        if (!editmode) return;
        try {
            const pwd = prompt("비밀번호를 입력해주세요.");
            if (!pwd) return;
            const data = new FormData();
            const json = JSON.stringify({
                b_idx: b_idx,
                subject: form.subject,
                writer: bbsdetail.writer,
                content: form.content,
                pwd: pwd,
                write_date: bbsdetail.write_date
            });
            data.append("data", new Blob([json], { type: "application/json" }));
            data.append("f_name", form.f_name);
            const update = await BbsDetailUpdate(data);
            if (update.data.result) {
                alert(update.data.message);
                resetForm();
                window.location.reload();
            } else {
                alert(update.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handlerepleupdate = async (c_idx, editContent) => {
        const reple = await RepleUpdate(c_idx, editContent)
        if (reple.data.result) {
            alert(reple.data.message);
            window.location.reload();
        } else {
            alert(reple.data.message);
        }
    }
    const handleDelete = async (c_idx) => {
        const repledelete = await RepleDelete(c_idx)
        if (repledelete.data.result) {
            alert(repledelete.data.message);
            window.location.reload();
        } else {
            alert(repledelete.data.meesage);
        }
    }
    const handleRepleOK = async (b_idx) => {
        try {
            const formdata = new FormData()
            formdata.append("content", form.content);
            formdata.append("b_idx", b_idx);
            formdata.append("writer", decoded.m_name);
            const repleok = await RepleOK(formdata);
            if (repleok.data.result) {
                alert(repleok.data.message);
                window.location.reload();
            } else {
                alert(repleok.data.message);
            }

        } catch (error) {
            console.log(error)
        }
    }
    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>로딩중...</div>
    if (error) return <div style={{ textAlign: "center", padding: "20px" }}>에러...</div>
    return (
        <>
            <div className="bbsdetail-main-div">
                <div className="bbsdetail-button">
                    {bbsdetail?.writer === decoded?.m_name && (
                        <>
                            {editmode ? (
                                <>
                                    <button type="button" onClick={() => handleSubmit()}>적용</button>
                                    <button type="button" onClick={() => handleCancel()}>취소</button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setEditmode(true)}>수정</button>
                                    <button type="button" onClick={() => BbsDetailDelete()}>삭제</button>
                                </>
                            )}
                        </>
                    )}
                </div>
                <button type="button" style={{ width: "100%", padding: "5px", margin: "10px auto", cursor: "pointer" }} onClick={() => navigate(`/bbs/${cPage}`)}>목록으로 돌아가기</button>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="author">Author</label>
                    <input type="text" id="author" name="writer" value={bbsdetail?.writer || ""} readOnly />
                    <label htmlFor="title">Subject</label>
                    <input type="text" id="title" name="subject" value={form.subject} onChange={handleChange} required readOnly={!editmode} />
                    <label htmlFor="content">Content</label>
                    {editmode ? (
                        <TiptapEditor key={form.content} value={form.content} onChange={content => handleChange({ target: { name: "content", value: content } })} />
                    ) : (
                        <input type="text" id="content" name="content" value={bbsdetail?.content || ""} readOnly />
                    )}
                    <label htmlFor="date">Written Date</label>
                    <input type="text" id="date" value={bbsdetail?.write_date || ""} readOnly />
                    <label htmlFor="">Attachment</label>
                    {editmode ? (
                        <input type="file" name="f_name" onChange={handleFileChange} />
                    ) : (
                        <input type="text" name="f_name" value={bbsdetail?.f_name ? bbsdetail?.f_name.substring(bbsdetail?.f_name.indexOf("_") + 1) : "No - Attachment"} onClick={bbsdetail?.f_name ? () => DownloadAndSaveFile(bbsdetail?.f_name) : undefined} style={{ cursor: bbsdetail?.f_name ? "pointer" : "default" }} readOnly />
                    )}
                </form>
            </div>
            <div className="bbsdetail-reple-div">
                <div className="reple-input-sticky">
                    <div className="reple-input-sticky">
                        <input type="text" name='content' value={form.content} onChange={handleChange} />
                        <button style={{ width: "15%" }} type="button" onClick={() => handleRepleOK(b_idx)}>댓글 작성</button>
                    </div>
                </div>
                <table className='bbsdetail-reple-table'>
                    <tbody>
                        {bbsdetailreple.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No - Reple</td>
                            </tr>
                        ) : (
                            <>
                                {bbsdetailreple.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ width: "55%", textAlign: 'left' }}>{repleeditmode === true ? (<input type='text' style={{ outline: "none", border: "none" }} value={editContent} onChange={(e) => setEditContent(e.target.value)} />) : (item.content)}</td>
                                        <td style={{ width: "10%" }}>{item.writer}</td>
                                        <td style={{ width: "15%" }}>{item.write_date.substring(0, 16)} </td>
                                        {item.writer === decoded?.m_name && (
                                            <>
                                                {editmode ? (
                                                    <>
                                                        <td style={{ width: "10%" }}><button style={{ width: "100%" }} type='button' onClick={() => handlerepleupdate(item.c_idx, editContent)}>확인</button></td>
                                                        <td style={{ width: "10%" }}><button style={{ width: "100%" }} type='button' onClick={() => setRepleeditmode(false)}>취소</button></td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ width: "10%" }}><button style={{ width: "100%" }} type="button" onClick={() => { setRepleeditmode(true); setEditContent(item.content) }}>수정</button></td>
                                                        <td style={{ width: "10%" }}><button style={{ width: "100%" }} type="button" onClick={() => handleDelete(item.c_idx)}>삭제</button></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>

                                ))}
                            </>
                        )}
                    </tbody>

                </table>
            </div>
        </>
    );
}