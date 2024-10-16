import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { StateInterface } from '../store';
import routes from './routes';

export default route<StateInterface>(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(
      process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach((to, from, next) => {

    if (!store.getters['all/isUserLoggedIn'] && to.path !== '/signin/login' && to.path !== '/signin/register') {
      next('/signin/login');
    }
    else if (store.getters['all/isUserLoggedIn'] && (to.path === '/signin/register' || to.path === '/signin/login')) {
      next('chat');
    }
    else {
      next();
    }
  });

  return Router;
});
