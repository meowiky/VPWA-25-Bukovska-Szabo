import { Module } from 'vuex';
import { StateInterface } from '../index';

export interface Message {
  channelName: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export interface MessagesState {
  messages: Message[];
}

interface SendMessagePayload {
  channelName: string;
  sender: string;
  content: string;
}

const messagesModule: Module<MessagesState, StateInterface> = {
  namespaced: true,
  state: {
    messages: [],
  },
  mutations: {
    sendMessage(state, message: Message) {
      state.messages.push(message);
    },
    setMessages(state, messages: Message[]) {
      state.messages = messages;
    },
  },
  actions: {
    sendMessage({ commit }, payload: SendMessagePayload) {
      const message: Message = {
        channelName: payload.channelName,
        sender: payload.sender,
        content: payload.content,
        timestamp: new Date(),
      };
      commit('sendMessage', message);
    },
    loadMessages({ commit }, channelName: string) {
      const fakeMessages: Message[] = [
        { channelName, sender: 'user1', content: 'Hello!', timestamp: new Date() },
        { channelName, sender: 'user2', content: 'Hey there!', timestamp: new Date() },
      ];
      commit('setMessages', fakeMessages);
    },
  },
};

export default messagesModule;
