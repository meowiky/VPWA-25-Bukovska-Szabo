import { MutationTree } from 'vuex';
import {AllStateInterface} from './state';


const mutation: MutationTree<AllStateInterface> = {
  toggleIsUserLoggedIn(state) {
    state.isUserLoggedIn = !state.isUserLoggedIn;
  },

  setToken(state, payload: string){
    state.token = payload;
    localStorage.setItem('token', payload);
  },

  removeToken(state){
    state.token = '';
    localStorage.removeItem('token');
  },

  toggleRightDrawerOpen(state) {
    state.rightDrawerOpen = !state.rightDrawerOpen;
  },

  setSelectedChannel(state, payload: object) {
    state.selectedChannel = payload;
    if (!payload) {
      state.channelMessages = [];
    }
  },

  setLoggedUser(state, payload: object)
  {
    state.loggedUser = payload;
  },

  setOtherUsers(state, payload: [])
  {
    state.usersAsMemberInterface = payload;
  },

  setAllPublicChannels(state, payload: []){
    state.publicChannels = payload;
  },

  setMessages(state, payload: []){
    state.channelMessages = payload;
  },

  // fetchNewMessage(state, payload: {content: string, timestamp: Date, channel: object, user: object}){
  //   const newMessage: MessageStateInterface = {
  //     content: payload.content,
  //     timestamp: payload.timestamp,
  //     user: payload.user
  //   }
  //   dbConn.saveMessage(newMessage, payload.channel);
  //   const channel = state.loggedUser.channels.find((ch) => ch === payload.channel);
  //   if (channel) {
  //     channel.messages.push(newMessage) // TODO push to messages table only
  //   }
  // },

  // setMentionsOnly(state, payload: boolean){
  //   state.mentionsOnly = payload
  // },

  // setUserStatus(state, payload: 'online' | 'offline' | 'DND') {
  //   state.loggedUser.user.status = payload
  // }
};

export default mutation;
