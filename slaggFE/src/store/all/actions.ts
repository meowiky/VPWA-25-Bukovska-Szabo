// store/actions.ts
import { ActionTree, ActionContext } from 'vuex';
import { StateInterface } from '../index';
import { AllStateInterface } from './state';
import * as dbConn from 'src/store/all/db_conn';

const actions: ActionTree<AllStateInterface, StateInterface> = {
  async login({ commit }: ActionContext<AllStateInterface, StateInterface>, payload: { email: string; password: string }) {
    try {
      const token = await dbConn.login(payload.email, payload.password);
      if (token) {
        commit('setToken', token);
        const loggeduser = await dbConn.getLoggedUser(token)
        if (loggeduser) {
          commit('setLoggedUser', loggeduser);
          commit('toggleIsUserLoggedIn');
          return loggeduser;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
    //const allUsers = await dbConn.getAllUsersAsMemberInterface(loggedUser);
    //commit('setOtherUsers', allUsers);
    //const allPublicChannels = await dbConn.getAllPublicChannels();
    //commit('setAllPublicChannels', allPublicChannels);
  },

  async register({ commit }: ActionContext<AllStateInterface, StateInterface>, payload: { username: string; email: string; password: string }) {
    try {
      const token = await dbConn.registerNewUser(payload.username, payload.email, payload.password);

      if (token) {
        commit('setToken', token);
        const loggeduser = await dbConn.getLoggedUser(token)
        if (loggeduser) {
          commit('setLoggedUser', loggeduser);
          commit('toggleIsUserLoggedIn');
          return loggeduser;
        }
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },

  async logOut({ commit }: ActionContext<AllStateInterface, StateInterface>, token: string) {
    try {
      const success = await dbConn.logout(token);

      if(success){
        commit('setToken', '');
        commit('setLoggedUser', null);
        commit('toggleIsUserLoggedIn');

      }
    } catch (error) {
      console.error('logout error:', error);
      return false;
    }
  }

};

export default actions;
