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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get(`/orders?access_token=${token}&seller_id=${userId}`);
                // ML generic search response structure
                setOrders(response.data.results || []);
            } catch (err: any) {
                console.error(err);
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        if (token && userId) {
            fetchOrders();
        }
    }, [token, userId]);

    if (loading) return <div>Loading sales...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Sales Dashboard</h2>
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
            {orders.length === 0 && <p>No orders found.</p>}
        </div>
    );
};
