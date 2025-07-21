import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "../styles/header.css"
import { logout } from "../api/Members";
export default function Header() {
    /**
     * zustand 전역 로그인 관리
     */
    const zu_isLoggedIn = useAuthStore((state) => state.zu_isLoggedIn);
    const zu_logout = useAuthStore((state) => state.zu_logout);
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        zu_logout();
        localStorage.removeItem("tokens");
        localStorage.removeItem("snsProvider");
        document.cookie = "snsProvider=; path=/; max-age=0";
        document.cookie = "authToken=; path=/; max-age=0";
        navigate("/login");
    }
    return (
        <header className="header">
            <div className="header-inner">
                {/** 왼쪽 : 로고 */}
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <img className="logo-image" src="/logo.png" alt="한국 ICT" />
                    </Link>
                </div>
                {/** 가운데 : 메뉴 */}
                <div className="header-center">
                    <Link to="/guestbook">방명록</Link>
                    <Link to="/bbs">게시판</Link>
                    <Link to="/support">고객센터</Link>
                </div>
                {/** 오른쪽 : 로그인, 회원가입, 로그아웃 */}
                <div className="header-right">
                    {zu_isLoggedIn ? (
                        <>
                            <button onClick={handleLogout}>Logout</button>
                            <Link to="/mypage">My Page</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}