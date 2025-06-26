import Dashboard from '@/components/pages/Dashboard';
import ChainEditor from '@/components/pages/ChainEditor';
import Templates from '@/components/pages/Templates';
import APISettings from '@/components/pages/APISettings';
import Analytics from '@/components/pages/Analytics';
import ChainPreview from '@/components/pages/ChainPreview';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  chains: {
    id: 'chains',
    label: 'Prompt Chains',
    path: '/chains',
    icon: 'Workflow',
    component: ChainEditor
  },
  templates: {
    id: 'templates',
    label: 'Templates',
    path: '/templates',
    icon: 'FileTemplate',
    component: Templates
  },
  settings: {
    id: 'settings',
    label: 'API Settings',
    path: '/settings',
    icon: 'Settings',
    component: APISettings
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    component: Analytics
  },
  preview: {
    id: 'preview',
    label: 'Preview',
    path: '/chains/:id/preview',
    icon: 'Eye',
    component: ChainPreview,
    hidden: true
  }
};

export const routeArray = Object.values(routes);
export default routes;