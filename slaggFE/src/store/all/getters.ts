import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AllStateInterface } from './state';

const getters: GetterTree<AllStateInterface, StateInterface> = {
  getLoggedUser (state) {
    return state.loggedUser
  },
  getSelectedChannel (state) {
    return state.selectedChannel
  }
};

export default getters;
