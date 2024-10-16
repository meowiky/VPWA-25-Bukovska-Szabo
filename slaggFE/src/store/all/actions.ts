import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AllStateInterface } from './state';

const actions: ActionTree<AllStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
};

export default actions;
