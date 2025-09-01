import Shell from '@/layout/Shell.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/customers/Customers.vue'
import Analytics from '@/views/Analytics.vue'
import Invoices from '@/views/Invoices.vue'
import Payments from '@/views/Payments.vue'

export default [
    // Страница логина - отдельно, без сайдбара
    { 
        path: '/login', 
        name: 'login', 
        component: Login 
    },
    
    // Основное приложение с сайдбаром
    {
        path: '/',
        component: Shell,
        children: [
            // Перенаправление с корня на дашборд
            {
                path: '',
                redirect: '/dashboard'
            },
            { 
                path: '/dashboard', 
                name: 'dashboard', 
                component: Dashboard 
            },
            { 
                path: '/customers', 
                name: 'customers', 
                component: Customers 
            },
            { 
                path: '/analytics', 
                name: 'analytics', 
                component: Analytics 
            },
            { 
                path: '/invoices', 
                name: 'invoices', 
                component: Invoices 
            },
            { 
                path: '/payments', 
                name: 'payments', 
                component: Payments 
            },
        ],
    },
    
    // Catch-all route - перенаправляем на дашборд
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]