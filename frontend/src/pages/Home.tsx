import React, { useState } from 'react';
import api from '../api/meli';

interface Order {
    id: number;
    date_created: string;
    total_amount: number;
    status: string;
    buyer: { nickname: string };
    order_items: { item: { title: string }, quantity: number, unit_price: number }[];
}

export const Home: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!userId || !refreshToken) return;
        setLoading(true);
        setError('');
        setOrders([]);

        try {
            const response = await api.get(`/manager/orders`, {
                params: { seller_id: userId, refresh_token: refreshToken }
            });
            setOrders(response.data.orders || []);
        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch data. Check permissions or token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#2d3277' }}>Meli Manager Dashboard</h1>

            <div style={{ backgroundColor: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Seller ID</label>
                    <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="e.g. 123456789"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Refresh Token</label>
                    <input
                        value={refreshToken}
                        onChange={(e) => setRefreshToken(e.target.value)}
                        placeholder="Paste refresh token here"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !userId || !refreshToken}
                    style={{
                        backgroundColor: '#ffd100',
                        color: '#333',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Fetching...' : 'Fetch Orders'}
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>#{order.id}</span>
                            <span>{new Date(order.date_created).toLocaleDateString()}</span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: order.status === 'paid' ? '#e6f4ea' : '#eee',
                                color: order.status === 'paid' ? '#1e8e3e' : '#666',
                                fontSize: '0.9rem'
                            }}>
                                {order.status}
                            </span>
                        </div>
                        <p>Buyer: {order.buyer.nickname}</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>R$ {order.total_amount}</p>
                    </div>
                ))}
            </div>
            {!loading && orders.length === 0 && <p style={{ color: '#666' }}>No orders to display.</p>}
        </div>
    );
};
