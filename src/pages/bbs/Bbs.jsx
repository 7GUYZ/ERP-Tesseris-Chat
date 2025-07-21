import { useEffect, useState } from "react";
import { UseLoadingError } from "../../components/hooks/UseLoadingError";
import { GetBbsList } from "../../api/Bbs";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/bbs.css"
export default function Bbs() {
    const navigate = useNavigate();
    const [bbslist, setBbslist] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const { loading, error, uiStatus } = UseLoadingError();
    useEffect(() => {
        const BbsList = async () => {
            try {
                const res = await GetBbsList(currentPage);
                uiStatus.start();
                console.log(res)
                if (res.data.result) {
                    if (Array.isArray(res.data.data)) {
                        setBbslist(res.data.data);
                        setTotalPages(1);
                        setCurrentPage(0);
                    } else if (Array.isArray(res.data.data.content)) {
                        setBbslist(res.data.data.content);
                        setTotalPages(res.data.data.totalPages);
                        setCurrentPage(res.data.data.number);
                    }
                }
                uiStatus.stop();
            } catch (error) {
                console.log(error.message);
                uiStatus.setError(error.message);
            } finally {
                uiStatus.stop();
            }
        }
        BbsList();
    }, [currentPage])
    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>로딩중...</div>
    if (error) return <div style={{ textAlign: "center", padding: "20px" }}>에러...</div>
    return (
        <>
            <button className="bbs-button" onClick={() => navigate(`/bbsinsert`)}>게시글 등록 </button>
            <div className="bbs-main-div">
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
                        {bbslist.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    작성된 게시글이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            bbslist.map((k, i) => (
                                <tr key={k.b_idx}>
                                    {/* 번호를 전체 인덱스 기준으로 (예: 1페이지=1~5, 2페이지=6~10) */}
                                    <td style={{ width: "10%" }}>
                                        {i + 1 + currentPage * 5}
                                        {/* currentPage는 0부터 시작, 5는 한 페이지당 개수 */}
                                    </td>
                                    <td>
                                        <Link to={`/bbsdetail/${currentPage}/${k.b_idx}`}>{k.subject}</Link>
                                    </td>
                                    <td style={{ width: "20%" }}>{k.writer}</td>
                                    <td style={{ width: "20%" }}>
                                        {k.write_date && k.write_date.substring(0, 10)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            disabled={idx === currentPage}
                            onClick={() => setCurrentPage(idx)}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>이전</button>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>다음</button>
            </div>

        </>
    );
}