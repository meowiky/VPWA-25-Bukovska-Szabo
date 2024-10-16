import { MutationTree } from 'vuex';
import {AllStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface} from './state';
import { ChannelStateInterface } from './state';
import * as dbConn from './db_conn';


const mutation: MutationTree<AllStateInterface> = {
  toggleIsUserLoggedIn(state) {
    state.isUserLoggedIn = !state.isUserLoggedIn;
  },

  setSelectedChannel(state, payload: ChannelStateInterface) {
    state.selectedChannel = payload;
  },

  setLoggedUser(state, payload: UserStateInterface)
  {
    state.loggedUser = payload;
  },

  createNewChannel(state, payload: {name: string, isPrivate: boolean}){
    const newChannel: ChannelStateInterface = {
      name: payload.name,
      isPrivate: payload.isPrivate,
      admin: state.loggedUser.user,
      members: [state.loggedUser.user],
      messages: []
    }
    dbConn.createNewChannel(newChannel);
    state.loggedUser.channels.push(newChannel)
  },

  leaveChannel(state, payload: ChannelStateInterface) {
    state.loggedUser.channels = state.loggedUser.channels.filter(channel => channel !== payload);
    dbConn.removeUserFromChannel(state.loggedUser.user, payload)
    if (state.loggedUser.user === payload.admin){
      mutation.deleteChannel(state, payload)
    }
  },

  joinChannel(state, payload: string){
    const channel = dbConn.getChannel(payload)
    if (channel == null) return

    dbConn.addUserToChannel(state.loggedUser.user, channel);
    channel.members.push(state.loggedUser.user)
    state.loggedUser.channels.push(channel)
  },

  deleteChannel(state, payload: ChannelStateInterface) {
    state.loggedUser.channels = state.loggedUser.channels.filter(channel => channel !== payload);
    dbConn.deleteChannel(payload);
  },

  kickMemberFromChannel(state, payload: {member: MemberStateInterface, channel: ChannelStateInterface}) {
    if (state.loggedUser.user === payload.channel.admin) {
      dbConn.removeUserFromChannel(payload.member, payload.channel);
      const channel = state.loggedUser.channels.find((ch) => ch === payload.channel);
      if (channel){
        channel.members = channel.members.filter((member) => member !== payload.member);
      }
    }
  },

  sendNewMessage(state, payload: {content: string, timestamp: Date, channel: ChannelStateInterface}){
    const newMessage: MessageStateInterface = {
      content: payload.content,
      timestamp: payload.timestamp,
      user: state.loggedUser.user
    }
    dbConn.saveMessage(newMessage, payload.channel);
    const channel = state.loggedUser.channels.find((ch) => ch === payload.channel);
    if (channel) {
      channel.messages.push(newMessage)
    }
  }
};

export default mutation;
