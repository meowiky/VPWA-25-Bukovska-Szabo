import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useUserStore } from 'src/stores/user';

export default route(function () {
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
    const userStore = useUserStore();
    const isUserLoggedIn = userStore.isUserLoggedIn;

    if (!isUserLoggedIn && to.path !== '/signin/login' && to.path !== '/signin/register') {
      next('/signin/login');
    }
    else if (isUserLoggedIn && (to.path === '/signin/register' || to.path === '/signin/login')) {
      next('/chat');
    }
    else {
      next();
    }
  });

  return Router;
});
