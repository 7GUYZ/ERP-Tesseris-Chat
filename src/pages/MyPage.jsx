import { useEffect, useState } from "react";
import { UseLoadingError } from "../components/hooks/UseLoadingError";
import "../styles/mypage.css"
import { getmypage } from "../api/Members";
export default function MyPage() {
    const [mypage, setMypage] = useState({
  m_id: '',
  m_name: '',
  m_phone: '',
  m_addr: '',
  m_addr2: '',
  m_email: '',
  m_reg: ''
});
    const { loading, error, uiStatus } = UseLoadingError();
    useEffect(() => {
        const callmypage = async () => {
            try {
                const res = await getmypage();
                uiStatus.start();
                console.log(res);
                if (res.data.result) {
                    setMypage({
                        m_id: res.data.data.m_id || "",
                        m_name: res.data.data.m_name || "",
                        m_phone: res.data.data.m_phone || "",
                        m_addr: res.data.data.m_addr || "",
                        m_addr2: res.data.data.m_addr2 || "",
                        m_email: res.data.data.m_email || "",
                        m_reg: res.data.data.m_reg.substring(0,16) || ""
                    })
                }
                uiStatus.stop();
            } catch (error) {
                console.log(error);
            }
        }
        callmypage();
    }, []);
    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>로딩중...</div>
    if (error) return <div style={{ textAlign: "center", padding: "20px" }}>에러...</div>
    return (
        <div className="mypage-maincontainer-div">
            <h2>My Page</h2>
            <label>ID</label>
            <input type="text" value={mypage?.m_id} readOnly />
            <label>NAME</label>
            <input type="text" value={mypage?.m_name} readOnly />
            <label>Call Number</label>
            <input type="text" readOnly value={mypage?.m_phone} />
            <label>Address</label>
            <input type="text" readOnly value={mypage?.m_addr} />
            <label>Detail Address</label>
            <input type="text" readOnly value={mypage?.m_addr2}/>
            <label>Email</label>
            <input type="text" readOnly value={mypage?.m_email}/>
            <label>Register Time</label>
            <input type="text" readOnly value={mypage?.m_reg}/>
        </div>
    );
}