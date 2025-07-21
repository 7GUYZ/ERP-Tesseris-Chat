import { useState } from "react";
import useAuthStore from "../store/authStore";
import { login } from "../api/Members";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"
import useEnterKey from "../components/hooks/HandleKeyDown";

export default function Login() {
    const zu_login = useAuthStore((state) => state.zu_login);
    const [m_id, setM_id] = useState('');
    const [m_pw, setM_pw] = useState('');
    const navigate = useNavigate();
    const handlelogin = async () => {
        try {
            if (m_id && m_pw) {
                const res = await login(m_id, m_pw)
                if (res.data.result) {
                    const { accessToken, refreshToken } = res.data.data
                    alert("로그인 성공")
                    localStorage.setItem("tokens", JSON.stringify({ accessToken, refreshToken }));
                    zu_login();
                    navigate(`/`);
                }else{
                    alert(res.data.message)
                }
            }
        } catch (error) {
                console.log(error)
                alert("로그인 에러");
        }
    }
    
    useEnterKey(handlelogin);
    
    return (
        <div className="login-wrapper">
            <h2>Login</h2>
            <p><input type="text" value={m_id} onChange={(e) => setM_id(e.target.value)} placeholder="아이디를 입력하세요." /></p>
            <p><input type="password" value={m_pw} onChange={(e) => setM_pw(e.target.value)} placeholder="비밀번호를 입력하세요."  /></p>
            <button className="normal-btn" onClick={handlelogin} disabled={!m_id || !m_pw}>일반 로그인</button>
            <div className="snslogin-btn">
                <img className="kakao-btn" src="/kakao_login_large_wide.png" alt="카카오로그인" />
                <img className="naver-btn" src="/btnG_official.png" alt="네이버로그인" />
            </div>

        </div>
    );
}