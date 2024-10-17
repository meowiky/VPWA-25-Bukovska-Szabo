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

  setOtherUsers(state, payload: MemberStateInterface[])
  {
    state.usersAsMemberInterface = payload;
  },

  createNewChannel(state, payload: {name: string, isPrivate: boolean}){
    const newChannel: ChannelStateInterface = {
      name: payload.name,
      isPrivate: payload.isPrivate,
      admin: state.loggedUser.user,
      members: [state.loggedUser.user],
      messages: [],
      kickVotes: []
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
    dbConn.removeUserFromChannel(payload.member, payload.channel);
    const channel = state.loggedUser.channels.find((ch) => ch === payload.channel);
    if (channel){
      channel.members = channel.members.filter((member) => member !== payload.member);
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
  },

  addMemberToChannel(state, payload: { member: MemberStateInterface, channel: ChannelStateInterface }) {
    dbConn.addUserToChannel(payload.member, payload.channel);

    if (state.selectedChannel.name === payload.channel.name) {
      state.selectedChannel.members = [...payload.channel.members]; // to ensure reactivity bcs it didnt reload the ui properly
    }
  },

  addKickVoteOrKickMember(state, payload: { member: MemberStateInterface, channel: ChannelStateInterface }) {
    const kickVoteEntry = payload.channel.kickVotes.find(vote => vote.member.nickName === payload.member.nickName);

    if (kickVoteEntry) {
      kickVoteEntry.votes.push({ voter: state.loggedUser.user });
    }
    else {
      payload.channel.kickVotes.push({
        member: payload.member,
        votes: [{ voter: state.loggedUser.user }]
      });
    }

    if (kickVoteEntry && kickVoteEntry.votes.length >= 3) {
      const index = payload.channel.kickVotes.findIndex(vote => vote.member.nickName === payload.member.nickName);
      if (index > -1) {
        payload.channel.kickVotes.splice(index, 1);
      }
      this.kickMemberFromChannel(state, payload);
    }
  }
};

export default mutation;
