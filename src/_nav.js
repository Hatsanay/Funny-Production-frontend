export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    badge: {
      color: 'primary',
    },
    permission_index: 1,
  },

  {
    component: 'CNavTitle',
    name: 'ระบบจัดการคิว',
    permission_index: 13,
  },
  {
    component: 'CNavItem',
    name: 'คิวงาน',
    to: '/queue',
    icon: 'cilLayers',
    permission_index: 13,
  },



  {
    component: 'CNavTitle',
    name: 'ออกจากระบบ',
    permission_index: 0,
  },
  {
    component: 'CNavItem',
    name: 'LOGOUT',
    to: '/login',
    icon: 'cilAccountLogout',
    permission_index: 0,
  },
]
