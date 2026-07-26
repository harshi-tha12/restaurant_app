import { Routes } from '@angular/router';

import { Home } from './features/customer/home/home';
import { Login } from './features/admin/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { CustomerMenu } from './features/customer/menu/menu';
import { OrderSuccess } from './features/customer/order-success/order-success';

export const routes: Routes = [

  {
    path:'',
    component:Home
  },

  {
    path:'admin/login',
    component:Login
  },

  {
    path:'admin/dashboard',
    component:Dashboard
  },

// Add this route to your existing routes
{
  path: 'menu',
  component: CustomerMenu
},
{ 
  path: 'order-success', 
  component: OrderSuccess 

}

];