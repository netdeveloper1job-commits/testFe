import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
     { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login) },
    {
    path: '',
    component: Layout,
    children: [
        { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
        { path: 'manage-compliance-category', loadComponent: () => import('./features/manage-compliance-category/manage-compliance-category').then(m => m.ManageComplianceCategory)},
        { path: 'calender' , loadComponent: () => import('./features/calender/calender').then(m => m.Calender)},
        { path: 'overdues' , loadComponent: () => import('./features/overdue/overdue').then(m => m.Overdue)},
        { path: 'auto-emailer' , loadComponent: () => import('./features/auto-emailer/auto-emailer').then(m => m.AutoEmailer)},
        { path: 'input-details' , loadComponent: () => import('./features/manage-compliance-category/manage-compliance-category').then(m => m.ManageComplianceCategory)},
        { path: 'location', loadComponent:() => import('./features/location-drilldown/location-drilldown').then(m => m.LocationDrilldown)},
        { path: 'locationsDetails/:industryTypeId' , loadComponent: () => import('./features/location-drilldown/location-details/location-details').then(m => m.LocationDetails)},
        { path: 'audit-log' , loadComponent:() => import('./features/audit-log/audit-log').then(m => m.AuditLog) },
        {
            path: 'event-log',
            loadComponent: () =>
                import('./features/event-log/event-log')
                .then(m => m.EventLog)
            }
    ]
    }
];
