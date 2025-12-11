import React, { useEffect, useState } from 'react';
import api from '../api/meli';

interface Order {
    id: number;
    date_created: string;
    total_amount: number;
    status: string;
    buyer: {
        id: number;
        nickname: string;
    };
    order_items: {
        item: {
            title: string;
        };
        quantity: number;
        unit_price: number;
    }[];
}

interface Props {
    token: string;
    userId: string;
}

export const SalesDashboard: React.FC<Props> = ({ token, userId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [targetUserId, setTargetUserId] = useState(userId);

    const fetchOrders = async (idToFetch: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/orders?access_token=${token}&seller_id=${idToFetch}`);
            // ML generic search response structure
            setOrders(response.data.results || []);
        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch orders. Ensure you have permission to view this user\'s data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && userId) {
            setTargetUserId(userId);
            fetchOrders(userId);
        }
    }, [token, userId]);

    const handleSearch = () => {
        if (targetUserId) {
            fetchOrders(targetUserId);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Sales Dashboard</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        placeholder="Enter User ID"
                        style={{ padding: '8px' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                        Search
                    </button>
                </div>
            </div>

            {loading && <div>Loading sales...</div>}
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                        <h3>Order #{order.id}</h3>
                        <p>Date: {new Date(order.date_created).toLocaleDateString()}</p>
                        <p>Status: {order.status}</p>
                        <p>Total: ${order.total_amount}</p>
                        <p>Buyer: {order.buyer.nickname}</p>
                        <ul>
                            {order.order_items.map((item, idx) => (
                                <li key={idx}>
                                    {item.quantity}x {item.item.title} (${item.unit_price})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            {!loading && orders.length === 0 && <p>No orders found.</p>}
        </div>
    );
};
