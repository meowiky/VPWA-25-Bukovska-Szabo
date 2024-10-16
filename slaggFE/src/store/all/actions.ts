import { ActionTree, ActionContext } from 'vuex';
import { StateInterface } from '../index';
import { AllStateInterface } from './state';
import * as dbConn from 'src/store/all/db_conn';

const actions: ActionTree<AllStateInterface, StateInterface> = {
  async login(commit: ActionContext<AllStateInterface, StateInterface>, payload: { email: string, password: string }) {
    const user = dbConn
    if (!user) { return false; }
    return dbConn.verifyUserCredentials(payload.email, payload.password);
  }
};

export default actions;
