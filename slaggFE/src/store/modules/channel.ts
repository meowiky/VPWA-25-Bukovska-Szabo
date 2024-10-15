import { Module } from 'vuex';
import { StateInterface } from '../index';

export interface Channel {
  name: string;
  isPrivate: boolean;
  admin: string;
  members: string[];
}

export interface ChannelsState {
  channels: Channel[];
}

interface CreateChannelPayload {
  channelName: string;
  isPrivate: boolean;
  admin: string;
}

interface MemberActionPayload {
  channelName: string;
  memberNick: string;
}

const channelsModule: Module<ChannelsState, StateInterface> = {
  namespaced: true,
  state: {
    channels: [],
  },
  mutations: {
    createChannel(state, payload: CreateChannelPayload) {
      state.channels.push({
        name: payload.channelName,
        isPrivate: payload.isPrivate,
        admin: payload.admin,
        members: [payload.admin],
      });
    },
    addMember(state, payload: MemberActionPayload) {
      const channel = state.channels.find(c => c.name === payload.channelName);
      if (channel && !channel.members.includes(payload.memberNick)) {
        channel.members.push(payload.memberNick);
      }
    },
    removeMember(state, payload: MemberActionPayload) {
      const channel = state.channels.find(c => c.name === payload.channelName);
      if (channel) {
        channel.members = channel.members.filter(m => m !== payload.memberNick);
      }
    },
    deleteChannel(state, channelName: string) {
      state.channels = state.channels.filter(c => c.name !== channelName);
    },
  },
  actions: {
    createChannel({ commit }, payload: CreateChannelPayload) {
      commit('createChannel', payload);
    },
    joinChannel({ commit }, payload: MemberActionPayload) {
      commit('addMember', payload);
    },
    leaveChannel({ commit }, payload: MemberActionPayload) {
      commit('removeMember', payload);
    },
    deleteChannel({ commit }, channelName: string) {
      commit('deleteChannel', channelName);
    },
  },
};

export default channelsModule;
