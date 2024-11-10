import { MutationTree } from 'vuex';
import {AllStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface} from './state';
import { ChannelStateInterface } from './state';
import * as dbConn from './db_conn';


const mutation: MutationTree<AllStateInterface> = {
  toggleIsUserLoggedIn(state) {
    state.isUserLoggedIn = !state.isUserLoggedIn;
  },

  setToken(state, payload: string){
    state.token = payload;
  },

  toggleRightDrawerOpen(state) {
    state.rightDrawerOpen = !state.rightDrawerOpen;
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

  setAllPublicChannels(state, payload: ChannelStateInterface[]){
    state.publicChannels = payload;
  },

  leaveChannel(state, payload: ChannelStateInterface) {
    state.loggedUser.channels = state.loggedUser.channels.filter(channel => channel !== payload);
    dbConn.removeUserFromChannel(state.loggedUser.user, payload)
    if (state.loggedUser.user === payload.admin){
      mutation.deleteChannel(state, payload)
    }
  },

  joinChannel(state, payload: ChannelStateInterface){
    dbConn.addUserToChannel(state.loggedUser.user, payload);
    // state.loggedUser.channels.push(payload) // TODO:: Push to pivot table
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
      channel.messages.push(newMessage) // TODO push to messages table only
    }
  },

  fetchNewMessage(state, payload: {content: string, timestamp: Date, channel: ChannelStateInterface, user: MemberStateInterface}){
    const newMessage: MessageStateInterface = {
      content: payload.content,
      timestamp: payload.timestamp,
      user: payload.user
    }
    dbConn.saveMessage(newMessage, payload.channel);
    const channel = state.loggedUser.channels.find((ch) => ch === payload.channel);
    if (channel) {
      channel.messages.push(newMessage) // TODO push to messages table only
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
      kickVoteEntry.votes.push({ voter: state.loggedUser.user }); // TODO:: Add to kickVotes table and push to it
    }
    else {
      payload.channel.kickVotes.push({
        member: payload.member,
        votes: [{ voter: state.loggedUser.user }]
      });   // TODO:: Add to kickVotes table and push to it
    }

    if (kickVoteEntry && kickVoteEntry.votes.length >= 3) {
      const index = payload.channel.kickVotes.findIndex(vote => vote.member.nickName === payload.member.nickName);
      if (index > -1) {
        payload.channel.kickVotes.splice(index, 1);
      }
      this.kickMemberFromChannel(state, payload);
    }
  },

  setMentionsOnly(state, payload: boolean){
    state.mentionsOnly = payload
  },

  setUserStatus(state, payload: 'online' | 'offline' | 'DND') {
    state.loggedUser.user.status = payload
  }
};

export default mutation;
