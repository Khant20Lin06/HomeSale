'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({ sales: 0, orders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/sales/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-800">Welcome to the Home Sales Management System.</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="rounded-lg bg-white p-6 shadow border border-gray-400">
                    <h3 className="text-sm font-medium text-black">Total Sales Today</h3>
                    <p className="mt-2 text-3xl font-bold text-black">
                        {loading ? 'Loading...' : `${stats.sales.toLocaleString()} MMK`}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow border border-gray-400">
                    <h3 className="text-sm font-medium text-black">Total Orders Today</h3>
                    <p className="mt-2 text-3xl font-bold text-black">
                        {loading ? 'Loading...' : stats.orders}
                    </p>
                </div>
            </div>
        </div>
    );
}
