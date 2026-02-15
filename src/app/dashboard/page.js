'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import SalesChart from '../../components/SalesChart';
import TopProducts from '../../components/TopProducts';

export default function DashboardPage() {
    const [stats, setStats] = useState({ sales: 0, orders: 0 });
    const [salesTrend, setSalesTrend] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, trendRes, topRes] = await Promise.all([
                    api.get('/sales/stats'),
                    api.get('/sales/trend'),
                    api.get('/sales/top-products')
                ]);

                setStats(statsRes.data);
                setSalesTrend(trendRes.data);
                setTopProducts(topRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-gray-500">Overview of your business performance.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="rounded-lg bg-white p-6 shadow border border-gray-400">
                    <h3 className="text-sm font-medium text-gray-500">Total Sales Today</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {loading ? '...' : `${stats.sales.toLocaleString()} MMK`}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow border border-gray-400">
                    <h3 className="text-sm font-medium text-gray-500">Total Orders Today</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {loading ? '...' : stats.orders}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <SalesChart data={salesTrend} />
                <TopProducts data={topProducts} />
            </div>
        </div>
    );
}
