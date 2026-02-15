'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import Modal from '../../../components/Modal';

export default function CategoriesPage() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            setFilteredCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const results = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(results);
        setCurrentPage(1);
    }, [searchTerm, categories]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/categories', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setFormData({ name: '', description: '' });
            setImageFile(null);
            setImagePreview(null);
            setEditingId(null);
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name, description: category.description });
        setImagePreview(category.image ? `http://localhost:5000${category.image}` : null);
        setImageFile(null);
        setEditingId(category._id);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setFormData({ name: '', description: '' });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete'))) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const ids = currentItems.map(item => item._id);
            setSelectedIds([...new Set([...selectedIds, ...ids])]);
        } else {
            // Unselect current page items
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
            // Need to delete one by one as backend doesn't support bulk delete yet
            await Promise.all(selectedIds.map(id => api.delete(`/categories/${id}`)));
            setSelectedIds([]);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete some categories');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('categories')}</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors"
                        >
                            <Trash2 className="w-5 h-5 mr-2" />
                            {t('deleteSelected')} ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
                        <Plus className="w-5 h-5 mr-2" />
                        {t('addCategory')}
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData({ name: '', description: '' }); setImageFile(null); setImagePreview(null); setEditingId(null); setError(''); }}
                title={editingId ? t('editCategory') : t('addCategory')}
            >
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')} *</label>
                        <input
                            type="text"
                            placeholder={t('name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                        <textarea
                            placeholder={t('description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('image')}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {editingId ? t('update') : t('save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Categories List */}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('image')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('loading')}</td></tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No categories found</td></tr>
                        ) : (
                            currentItems.map((cat) => (
                                <tr key={cat._id} className={selectedIds.includes(cat._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(cat._id)}
                                            onChange={() => handleSelectOne(cat._id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cat.image ? (
                                            <img
                                                src={`http://localhost:5000${cat.image}`}
                                                alt={cat.name}
                                                className="h-10 w-10 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                                <span className="text-xs">No img</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{cat.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{cat.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(cat)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3" title={t('edit')}>
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title={t('delete')}>
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
        </div>
    );
}
