import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/customers/Customers.vue'
import Analytics from '@/views/Analytics.vue'
import Invoices from '@/views/Invoices.vue'
import Payments from '@/views/Payments.vue'

export default [
    // Страница логина (доступна всем)
    { 
        path: '/login', 
        name: 'login', 
        component: Login 
    },
    
    // Основные страницы приложения (требуют авторизации)
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/customers',
        name: 'customers',
        component: Customers,
        meta: { requiresAuth: true }
    },
    {
        path: '/analytics',
        name: 'analytics',
        component: Analytics,
        meta: { requiresAuth: true }
    },
    {
        path: '/invoices',
        name: 'invoices',
        component: Invoices,
        meta: { requiresAuth: true }
    },
    {
        path: '/payments',
        name: 'payments',
        component: Payments,
        meta: { requiresAuth: true }
    },
    
    // Catch-all route - перенаправляем на дашборд
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]