import { ChannelStateInterface, MemberStateInterface } from './state';

export function getChannel(name: string) {
    const channel: ChannelStateInterface = {
      name: name,
      isPrivate: false,
      admin: {
          firstName: '',
          lastName: '',
          nickName: '',
          status: 'online'
      },
      members: [],
      messages: []
    }
    return channel;
}

export function registerNewUser() {
    return;
}

export function createNewChannel(channel: ChannelStateInterface) {
    return channel;
}

export function deleteChannel(channel: ChannelStateInterface) {
    return channel;
}

export function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
    return [user, channel];
}

export function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
    return [user, channel];
}
