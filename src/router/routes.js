import Shell from '@/layout/Shell.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/customers/Customers.vue'
import Analytics from '@/views/Analytics.vue'
import Invoices from '@/views/Invoices.vue'
import Payments from '@/views/Payments.vue'

export default [
    { path: '/login', name: 'login', component: Login },
    {
        path: '/',
        component: Shell,
        children: [
            { path: '', name: 'dashboard', component: Dashboard },
            { path: 'customers', name: 'customers', component: Customers },
            { path: 'analytics', name: 'analytics', component: Analytics },
            { path: 'invoices', name: 'invoices', component: Invoices },
            { path: 'payments', name: 'payments', component: Payments },
        ],
    },
]
