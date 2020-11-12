import { Plugin } from 'vue-fragment';
import { boot } from 'quasar/wrappers';

export default boot(({ Vue }) => {
  Vue.use(Plugin);
});
