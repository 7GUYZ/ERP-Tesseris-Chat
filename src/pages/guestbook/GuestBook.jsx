import { useEffect, useState } from "react";
import { UseLoadingError } from "../../components/hooks/UseLoadingError";
import { GetGuestBookList } from "../../api/GuestBook";
import '../../styles/guestbook.css'
import { Link, useNavigate } from "react-router-dom";

export default function GuestBook() {
    const navigate = useNavigate();
    const [guestbook, setGuestbook] = useState([]);
    const { loading, error, uiStatus } = UseLoadingError();
    useEffect(() => {
        const GuestBookList = async () => {
            try {
                const res = await GetGuestBookList();
                setGuestbook(res.data.data ?? []);
                console.log(res.data.message)
                uiStatus.stop();
                uiStatus.reset();
            } catch (error) {
                console.log(error.message);
                uiStatus.setError(error.message);
            } finally {
                uiStatus.stop();
            }
        }
        GuestBookList();
    }, [])
    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>로딩중...</div>
    if (error) return <div style={{ textAlign: "center", padding: "20px" }}>에러...</div>
    return (
        <div className="guestbook-main-div">
            <button type="button" onClick={()=> navigate(`/guestbookinsert`)}>방명록 작성</button>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성날짜</th>
                    </tr>
                </thead>
                <tbody>
                    {guestbook.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>
                                작성된 방명록이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        guestbook.map((k, i) => {
                            return (
                                <tr key={i}>
                                    <td style={{width: "10%"}}>{i + 1}</td>
                                    <td><Link to={`/guestbookdetail/${k.gb_idx}`}>{k.gb_subject}</Link></td>
                                    <td style={{width: "20%"}}>{k.gb_name}</td>
                                    <td style={{width: "20%"}}>{k.gb_regdate.substring(0, 10)}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}