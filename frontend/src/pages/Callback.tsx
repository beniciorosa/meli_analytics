import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
    setAuth: (token: string, userId: string) => void;
}

export const Callback: React.FC<Props> = ({ setAuth }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('access_token');
        const userId = searchParams.get('user_id');

        if (token && userId) {
            setAuth(token, userId);
            // In real app, might save to localStorage here
            navigate('/');
        }
    }, [searchParams, setAuth, navigate]);

    return <div>Authenticating...</div>;
};
