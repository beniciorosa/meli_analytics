import React, { useEffect, useState } from 'react';
import api from '../api/meli';

export const ConnectMeli: React.FC = () => {
    const [authUrl, setAuthUrl] = useState<string>('');

    useEffect(() => {
        api.get('/auth/url').then(res => {
            setAuthUrl(res.data.url);
        });
    }, []);

    const handleLogin = () => {
        if (authUrl) {
            window.location.href = authUrl;
        }
    };

    return (
        <button
            onClick={handleLogin}
            disabled={!authUrl}
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#ffd100', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
            Connect Mercado Livre
        </button>
    );
};
