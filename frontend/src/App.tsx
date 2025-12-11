import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Callback } from './pages/Callback';

function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('ml_token') || '');
  const [userId, setUserId] = useState<string>(localStorage.getItem('ml_user_id') || '');

  const setAuth = (newToken: string, newUserId: string) => {
    localStorage.setItem('ml_token', newToken);
    localStorage.setItem('ml_user_id', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home token={token} userId={userId} />} />
        <Route path="/callback" element={<Callback setAuth={setAuth} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
