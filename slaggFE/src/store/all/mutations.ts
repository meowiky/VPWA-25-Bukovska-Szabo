import { MutationTree } from 'vuex';
import { AllStateInterface} from './state';
import { ChannelStateInterface } from './state';
import * as dbConn from './db_conn';


const mutation: MutationTree<AllStateInterface> = {
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
    dbConn.addUserToChannel(state.loggedUser.user, channel);
    channel.members.push(state.loggedUser.user)
    state.loggedUser.channels.push(channel)
  },

  deleteChannel(state, payload: ChannelStateInterface) {
    state.loggedUser.channels = state.loggedUser.channels.filter(channel => channel !== payload);
    dbConn.deleteChannel(payload);
  }
};

export default mutation;
