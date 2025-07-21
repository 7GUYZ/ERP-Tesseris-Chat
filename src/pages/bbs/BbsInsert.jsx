import { useNavigate } from "react-router-dom";
import "../../styles/bbsinsert.css"
import UseForm from "../../components/hooks/UseForm";
import TiptapEditor from "../../components/TipTap";
import { BbsInsertOK } from "../../api/Bbs";

export default function BbsInsert() {
    const navigate = useNavigate();
    const { form, handleChange, handleFileChange, resetForm } = UseForm({
        subject: "",
        content: "",
        pwd: "",
        file: null
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            const json = JSON.stringify({
                subject: form.subject,
                content: form.content,
                pwd: form.pwd
            });
            data.append("data", new Blob([json], {type: "application/json"}));
            data.append("f_name", form.f_name);
            const res = await BbsInsertOK(data);
            if (res.data.result) {
                alert(res.data.message);
                resetForm();
                navigate(`/bbsdetail/0/${res.data.data}`)
            }else{
                alert(res.data.result);
            }
        } catch (error) {
            console.log(error);
            window.location.reload();
        }
    }
    return (
        <div className="bbsinsert-main-div">
            <div className="bbsinsert-button">
                <button onClick={handleSubmit}>등록</button>
                <button onClick={() => navigate(`/bbs`)}>취소</button>
            </div>
            <hr style={{ width: "100%", margin: "15px auto" }} />
            <form>
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="제목을 입력하세요." />
                <label htmlFor="content">Content</label>
                <TiptapEditor id="content" value={form.content} onChange={content => handleChange({ target: { name: "content", value: content } })} />
                <label htmlFor="pwd">Pwd</label>
                <input type="text" id="pwd" name="pwd" value={form.pwd} onChange={handleChange} required placeholder="비밀번호를 입력하세요." />
                <label htmlFor="">AttachMent</label>
                <input type="file" name="f_name" onChange={handleFileChange} />
            </form>
        </div>
    );
}