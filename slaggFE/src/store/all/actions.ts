// store/actions.ts
import { ActionTree, ActionContext } from 'vuex';
import { StateInterface } from '../index';
import { AllStateInterface } from './state';
import * as dbConn from 'src/store/all/db_conn';

const actions: ActionTree<AllStateInterface, StateInterface> = {
  async login({ commit }: ActionContext<AllStateInterface, StateInterface>, payload: { email: string; password: string }) {
    const loggedUser = await dbConn.verifyUserCredentials(payload.email, payload.password);

    if (!loggedUser) {
      return false;
    }
    commit('setLoggedUser', loggedUser);
    const allUsers = await dbConn.getAllUsersAsMemberInterface(loggedUser);
    commit('setOtherUsers', allUsers);
    return loggedUser;
  }
};

export default actions;
