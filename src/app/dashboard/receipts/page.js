'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Eye, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import Modal from '../../../components/Modal';

export default function ReceiptsPage() {
    const { t } = useLanguage();
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const { data } = await api.get('/sales');
            setSales(data);
            setFilteredSales(data);
        } catch (err) {
            console.error('Failed to fetch sales', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const results = sales.filter(sale =>
            sale.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.cashier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSales(results);
        setCurrentPage(1);
    }, [searchTerm, sales]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete'))) return;
        try {
            await api.delete(`/sales/${id}`);
            fetchSales();
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } catch (err) {
            alert('Failed to delete receipt');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const ids = currentItems.map(item => item._id);
            setSelectedIds([...new Set([...selectedIds, ...ids])]);
        } else {
            const currentIds = currentItems.map(item => item._id);
            setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return alert(t('noItemsSelected'));
        if (!confirm(t('confirmDeleteSelected'))) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/sales/${id}`)));
            setSelectedIds([]);
            fetchSales();
        } catch (err) {
            alert('Failed to delete some receipts');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('receipts')}</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        {t('deleteSelected')} ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item._id))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('receiptNo')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('cashier')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('totalItems')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('totalAmount')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('loading')}</td></tr>
                        ) : filteredSales.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No sales records found</td></tr>
                        ) : (
                            currentItems.map((sale) => (
                                <tr key={sale._id} className={selectedIds.includes(sale._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(sale._id)}
                                            onChange={() => handleSelectOne(sale._id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{sale.receiptNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">
                                        {new Date(sale.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{sale.cashier?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{sale.items.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">{sale.totalAmount} Ks</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedReceipt(sale)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3" title={t('view')}>
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(sale._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title={t('delete')}>
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" /> {t('prev')}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t('page')} {currentPage} {t('of')} {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 disabled:opacity-50"
                        >
                            {t('next')} <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Receipt Detail Modal */}
            {/* Receipt Detail Modal */}
            <Modal
                isOpen={!!selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
                title={`${t('receipts')} #${selectedReceipt?.receiptNumber}`}
            >
                {selectedReceipt && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                            <p>{new Date(selectedReceipt.createdAt).toLocaleString()}</p>
                            <div className="text-right"><span className="font-semibold">{t('totalItems')}:</span> {selectedReceipt.items.length}</div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('products')}</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedReceipt.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-gray-900 dark:text-white">{item.product?.name || 'Deleted Product'}</td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{item.price}</td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{item.quantity * item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div><span className="font-semibold text-gray-700 dark:text-gray-300">{t('cashier')}:</span> <span className="text-gray-900 dark:text-white">{selectedReceipt.cashier?.name || 'Unknown'}</span></div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('totalAmount')}: {selectedReceipt.totalAmount} Ks
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
