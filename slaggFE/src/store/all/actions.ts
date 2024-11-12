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

        const data = await dbConn.getLoggedUser(token);

        if (data) {
          const { user, allPublicChannels, allUsers } = data;
          commit('setLoggedUser', user);
          commit('setAllPublicChannels', allPublicChannels);
          commit('setOtherUsers', allUsers);
          commit('toggleIsUserLoggedIn');
          commit('setSelectedChannel', null);

          return user;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  async register({ commit }: ActionContext<AllStateInterface, StateInterface>, payload: { username: string; email: string; password: string }) {
    try {
      const token = await dbConn.registerNewUser(payload.username, payload.email, payload.password);

      if (token) {
        commit('setToken', token);
        const data = await dbConn.getLoggedUser(token);

        if (data) {
          const { user, allPublicChannels, allUsers } = data;
          commit('setLoggedUser', user);
          commit('setAllPublicChannels', allPublicChannels);
          commit('setOtherUsers', allUsers);
          commit('toggleIsUserLoggedIn');
          commit('setSelectedChannel', null);

          return user;
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
        commit('setOtherUsers', null);
        commit('setSelectedChannel', null);

      }
    } catch (error) {
      console.error('logout error:', error);
      return false;
    }
  },

  async reloadData({ commit }: ActionContext<AllStateInterface, StateInterface>, token: string) {
    const data = await dbConn.getLoggedUser(token);
    if (data) {
      const { user, allPublicChannels, allUsers } = data;
      commit('setLoggedUser', user);
      commit('setAllPublicChannels', allPublicChannels);
      commit('setOtherUsers', allUsers);

      return user;
    }
  },

  async createNewChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {name: string, isPrivate: boolean, token: string}){
    const newChannel = {
      name: payload.name,
      isPrivate: payload.isPrivate,
    }
    await dbConn.createNewChannel(newChannel, payload.token);
    await dispatch('reloadData', payload.token);
  },

  async deleteChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {name: string, token: string}){
    await dbConn.deleteChannel(payload.name, payload.token);
    await dispatch('reloadData', payload.token);
  },

  async leaveChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {name: string, token: string}){
    await dbConn.leaveChannel(payload.name, payload.token);
    await dispatch('reloadData', payload.token);
  },

  async kickUserFromChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string, user: string}){
    await dbConn.kickUserFromChannel(payload.channel, payload.token, payload.user);
    await dispatch('reloadData', payload.token);
  },

  async addUserToChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string, user: string}){
    await dbConn.addUserToChannel(payload.channel, payload.token, payload.user);
    await dispatch('reloadData', payload.token);
  },

  async joinPublicChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string}){
    await dbConn.joinPublicChannel(payload.channel, payload.token);
    await dispatch('reloadData', payload.token);
  },

  async requestKickUserFromChannel({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string, user: string}){
    await dbConn.requestKickUserFromChannel(payload.channel, payload.token, payload.user);
    await dispatch('reloadData', payload.token);
  },

  async fetchMessages({ commit }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string}){
    const messages = await dbConn.getMessages(payload.channel, payload.token);
    commit('setMessages', messages);
  },

  async sendNewMessage({ dispatch }: ActionContext<AllStateInterface, StateInterface>, payload: {channel: string, token: string, message: string}){
    await dbConn.saveMessage(payload.channel, payload.token, payload.message);
    await dispatch('reloadData', payload.token);
  }
}

export default actions;
