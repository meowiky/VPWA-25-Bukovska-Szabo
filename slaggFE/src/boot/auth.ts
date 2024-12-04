import { boot } from 'quasar/wrappers';

export default boot(async ({ store }) => {
  try {
    await store.dispatch('all/initializeAuth');
  } catch (error) {
    console.error('Error during auth initialization:', error);
  }
});



