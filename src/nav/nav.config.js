export const nav = [
    { title: 'Дэшборд',  icon: 'dashboard',     to: { name: 'dashboard' } },
    { title: 'Клиенты',  icon: 'people',       to: { name: 'customers' } },
    { title: 'Аналитика', icon: 'analytics',   to: { name: 'analytics' } },
    // группы и вложенные пункты — по желанию:
    {
      title: 'Финансы', icon: 'account_balance_wallet',
      children: [
        { title: 'Счета',    icon: 'receipt', to: { name: 'invoices' } },
        { title: 'Платежи',  icon: 'payment', to: { name: 'payments' } },
      ]
    }
]
