import Shell from '@/layout/Shell.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/customers/Customers.vue'
import Analytics from '@/views/Analytics.vue'

export default [
    { path: '/login', name: 'login', component: Login, meta: { public: true } },
    {
        path: '/',
        component: Shell,
        children: [
            { path: '', name: 'dashboard', component: Dashboard },
            { path: 'customers', name: 'customers', component: Customers },
            { path: 'analytics', name: 'analytics', component: Analytics },
        ],
    },
]
