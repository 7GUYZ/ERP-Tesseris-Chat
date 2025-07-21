import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from './pages/Main';
import Login from './pages/Login';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import Bbs from './pages/bbs/Bbs';
import GuestBook from './pages/guestbook/GuestBook';
import GuestBookInsert from './pages/guestbook/GuestBookInsert';
import GuestBookDetail from './pages/guestbook/GuestBookDetail';
import BbsInsert from './pages/bbs/BbsInsert';
import MyPage from './pages/MyPage';
import Signup from './pages/Signup';
import BbsDetail from './pages/bbs/BbsDetail';

function App() {
  useEffect(()=>{
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      useAuthStore.getState().zu_login();
    }
  },[])
  return (
    <AuthProvider>
      <div className="app-container">
        <BrowserRouter>
            <Header />
              <div className='main-container'>
                <Routes>
                  <Route path='/' element={<Main />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/mypage' element={<MyPage />} />
                  <Route path='/bbs' element={<Navigate to="/bbs/0" />} />
                  <Route path='/bbs/:cPage' element={<Bbs />} />
                  <Route path='/bbsdetail/:cPage/:b_idx' element={<BbsDetail />} />
                  <Route path='/bbsinsert' element={<BbsInsert />} />
                  <Route path='/guestbook' element={<GuestBook />} />
                  <Route path='/guestbookdetail/:gb_idx' element={<GuestBookDetail />} />
                  <Route path='/guestbookinsert' element={<GuestBookInsert />} />
                  <Route path='/signup' element={<Signup />} />
                </Routes>
              </div>
              <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
