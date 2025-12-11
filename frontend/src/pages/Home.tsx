import React from 'react';
import { ConnectMeli } from '../components/ConnectMeli';
import { SalesDashboard } from '../components/SalesDashboard';

interface Props {
    token: string;
    userId: string;
}

export const Home: React.FC<Props> = ({ token, userId }) => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Meli Analytics</h1>

            {!token ? (
                <div>
                    <p>Connect your Mercado Livre account to view sales data.</p>
                    <ConnectMeli />
                </div>
            ) : (
                <SalesDashboard token={token} userId={userId} />
            )}
        </div>
    );
};
