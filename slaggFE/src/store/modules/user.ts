import { Module } from 'vuex';
import { StateInterface } from '../index';

export interface UserState {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  password?: string;
  status: 'online' | 'DND' | 'offline';
  isLoggedIn: boolean;
  channels: string[];
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  password: string;
}

const userModule: Module<UserState, StateInterface> = {
  namespaced: true,
  state: {
    firstName: '',
    lastName: '',
    nickName: '',
    email: '',
    password: undefined,
    status: 'offline',
    isLoggedIn: false,
    channels: [],
  },
  mutations: {
    login(state, payload: RegisterPayload) {
      state.firstName = payload.firstName;
      state.lastName = payload.lastName;
      state.nickName = payload.nickName;
      state.email = payload.email;
      state.status = 'online';
      state.isLoggedIn = true;
    },
    logout(state) {
      state.firstName = '';
      state.lastName = '';
      state.nickName = '';
      state.email = '';
      state.status = 'offline';
      state.isLoggedIn = false;
      state.channels = [];
    },
    setStatus(state, status: 'online' | 'DND' | 'offline') {
      state.status = status;
    },
    joinChannel(state, channelName: string) {
      if (!state.channels.includes(channelName)) {
        state.channels.push(channelName);
      }
    },
    leaveChannel(state, channelName: string) {
      state.channels = state.channels.filter(channel => channel !== channelName);
    },
    register(state, payload: RegisterPayload) {
      const userData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        nickName: payload.nickName,
        email: payload.email,
        password: payload.password,
      };
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      state.isLoggedIn = true;
    },
  },
  actions: {
    login({ commit }, payload: LoginPayload) {
      const userStr = localStorage.getItem('registeredUser');
      if (userStr) {
        const registeredUser = JSON.parse(userStr);
        if (
          registeredUser.email === payload.email &&
          registeredUser.password === payload.password
        ) {
          commit('login', registeredUser);
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        throw new Error('User not registered');
      }
    },
    register({ commit }, payload: RegisterPayload) {
      commit('register', payload);
    },
    logout({ commit }) {
      commit('logout');
    },
    setStatus({ commit }, status: 'online' | 'DND' | 'offline') {
      commit('setStatus', status);
    },
    joinChannel({ commit }, channelName: string) {
      commit('joinChannel', channelName);
    },
    leaveChannel({ commit }, channelName: string) {
      commit('leaveChannel', channelName);
    },
  },
};

export default userModule;
