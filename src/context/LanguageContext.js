'use client';
import { createContext, useContext, useState } from 'react';

const translations = {
    en: {
        dashboard: 'Dashboard',
        pos: 'POS / Sale',
        products: 'Products',
        categories: 'Categories',
        receipts: 'Receipts',
        users: 'Users',
        logout: 'Logout',
        homeSales: 'Home Sales',
        totalSales: 'Total Sales Today',
        totalOrders: 'Total Orders Today',
        loading: 'Loading...',
        welcome: 'Welcome to the Home Sales Management System.',
        login: 'Login',
        register: 'Register',
        username: 'Username',
        password: 'Password',
        name: 'Name',
        role: 'Role',
        submit: 'Submit',
        cancel: 'Cancel',
        addToCart: 'Add to Cart',
        checkout: 'Checkout',
        search: 'Search...',
        currentOrder: 'Current Order',
        cartEmpty: 'Cart is empty',
        receiptNo: 'Receipt No',
        date: 'Date',
        cashier: 'Cashier',
        totalItems: 'Total Items',
        totalAmount: 'Total Amount',
        actions: 'Actions',
        searchPlaceholder: 'Search...',
        deleteSelected: 'Delete Selected',
        prev: 'Prev',
        next: 'Next',
        page: 'Page',
        of: 'of',
        confirmDelete: 'Are you sure you want to delete?',
        confirmDeleteSelected: 'Are you sure you want to delete selected items?',
        noItemsSelected: 'No items selected',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        create: 'Create',
        update: 'Update'
    },
    mm: {
        dashboard: 'ဒက်ရှ်ဘုတ်', // Dashboard
        pos: 'အရောင်း', // Sale
        products: 'ကုန်ပစ္စည်းများ', // Products
        categories: 'အမျိုးအစားများ', // Categories
        receipts: 'ပြေစာများ', // Receipts
        users: 'အသုံးပြုသူများ', // Users
        logout: 'ထွက်မည်', // Logout
        homeSales: 'အိမ်အရောင်းဆိုင်', // Home Sales
        totalSales: 'ယနေ့ ရောင်းရငွေ', // Total Sales Today
        totalOrders: 'ယနေ့ အမှာစာများ', // Total Orders Today
        loading: 'Loading...',
        welcome: 'အိမ်အရောင်းဆိုင် စီမံခန့်ခွဲမှုစနစ်မှ ကြိုဆိုပါသည်။',
        login: 'အကောင့်ဝင်ရန်',
        register: 'အကောင့်သစ်ဖွင့်ရန်',
        username: 'အသုံးပြုသူအမည်',
        password: 'စကားဝှက်',
        name: 'အမည်',
        role: 'ရာထူး',
        submit: 'အတည်ပြုမည်',
        cancel: 'မလုပ်တော့ပါ',
        addToCart: 'လှည်းထဲထည့်မည်',
        checkout: 'ငွေရှင်းမည်',
        search: 'ရှာဖွေရန်...',
        currentOrder: 'လက်ရှိ အမှာစာ',
        cartEmpty: 'လှည်းထဲတွင် ဘာမှမရှိပါ',
        receiptNo: 'ပြေစာနံပါတ်',
        date: 'နေ့စွဲ',
        cashier: 'ငွေကိုင်',
        totalItems: 'ပစ္စည်းအရေအတွက်',
        totalAmount: 'စုစုပေါင်း',
        actions: 'လုပ်ဆောင်ချက်များ',
        searchPlaceholder: 'ရှာဖွေပါ...',
        deleteSelected: 'ရွေးချယ်ထားသည်များကို ဖျက်မည်',
        prev: 'ရှေ့',
        next: 'နောက်',
        page: 'စာမျက်နှာ',
        of: '၏',
        confirmDelete: 'ဖျက်ရန် သေချာပါသလား?',
        confirmDeleteSelected: 'ရွေးချယ်ထားသည်များကို ဖျက်ရန် သေချာပါသလား?',
        noItemsSelected: 'မည်သည့်အရာမျှ ရွေးချယ်ထားခြင်းမရှိပါ',
        edit: 'ပြင်ဆင်မည်',
        delete: 'ဖျက်မည်',
        view: 'ကြည့်မည်',
        create: 'အသစ်ဖန်တီးမည်',
        update: 'ပြင်ဆင်မှုသိမ်းမည်'
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'mm' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
