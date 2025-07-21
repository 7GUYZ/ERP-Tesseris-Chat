import { useNavigate } from "react-router-dom";
import "../../styles/guestbookinsert.css"
import { GuestBookInsertOK } from "../../api/GuestBook";
import UseForm from "../../components/hooks/UseForm";
import TiptapEditor from "../../components/TipTap";
export default function GuestBookInsert() {
    const navigate = useNavigate();
    const { form, handleChange, handleFileChange, resetForm } = UseForm({
        gb_subject: "",
        gb_content: "",
        gb_pw: "",
        file: null
    })
    const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const data = new FormData();
                const json = JSON.stringify({
                    gb_subject: form.gb_subject,
                    gb_content: form.gb_content,
                    gb_pw: form.gb_pw,
                })
                data.append("data", new Blob([json], { type: "application/json" }))
                data.append("gb_f_name", form.file);
                const res = await GuestBookInsertOK(data);
                if (res.data.result) {
                    alert(res.data.message);
                    resetForm();
                    navigate(`/guestbookdetail/${res.data.data}`);
                }else{
                    alert(res.data.message);
                    window.location.reload();
                }
            } catch (error) {
                console.log(error.message);
                navigate(`/guestbook`);
            }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="guestbook-insert-div">
                <div className="guestbook-insert-button">
                    <button type="submit">등록</button>
                    <button type="button" onClick={() => navigate(`/guestbook`)}>취소</button>
                </div>
                <hr style={{ width: "100%" }} />
                <label htmlFor="Subject">Subject</label>
                <input type="text" name="gb_subject" id="Subject" value={form.gb_subject} onChange={handleChange} required placeholder="제목을 입력해 주세요." />
                <label htmlFor="Content">Content</label>
                {/* <input type="text" name="gb_content" id="Content" value={form.gb_content} onChange={handleChange} placeholder="내용을 입력해주세요." /> */}
                <TiptapEditor value={form.gb_content} onChange={content => handleChange({target: {name: "gb_content", value: content}})} placeholder="본문을 입력하세요 "/>
                <label htmlFor="Writting-PW">Writting PW</label>
                <input type="password" name="gb_pw" id="Writting-PW" value={form.gb_pw} onChange={handleChange} required placeholder="게시글 비밀번호를 입력해주세요." />
                <hr style={{ width: "100%" }} />
                <label htmlFor="attachment">Attachment</label>
                <input type="file" name="gb_f_name" id="attachment" onChange={handleFileChange} />
            </div>
        </form>
    );
}