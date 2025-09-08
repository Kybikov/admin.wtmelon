import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue' 
import Customers from '@/views/Customers.vue'
import Accounts from '@/views/Accounts.vue'
import Subscriptions from '@/views/Subscriptions.vue'
import NewSubscription from '@/views/NewSubscription.vue'
import Analytics from '@/views/Analytics.vue'
import Invoices from '@/views/Invoices.vue'
import Payments from '@/views/Payments.vue'
import Products from '@/views/Products.vue'
import Orders from '@/views/Orders.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'

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
        path: '/accounts',
        name: 'accounts',
        component: Accounts,
        meta: { requiresAuth: true }
    },
    {
        path: '/subscriptions',
        name: 'subscriptions',
        component: Subscriptions,
        meta: { requiresAuth: true }
    },
    {
        path: '/subscriptions/new',
        name: 'new-subscription',
        component: NewSubscription,
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
    {
        path: '/products',
        name: 'products',
        component: Products,
        meta: { requiresAuth: true }
    },
    {
        path: '/orders',
        name: 'orders',
        component: Orders,
        meta: { requiresAuth: true }
    },
    {
        path: '/reports',
        name: 'reports',
        component: Reports,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: { requiresAuth: true }
    },
    
    // Catch-all route - перенаправляем на дашборд
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]