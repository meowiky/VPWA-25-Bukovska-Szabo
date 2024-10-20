import {ChannelStateInterface, MemberStateInterface, MessageStateInterface, UserStateInterface} from './state';
import * as db from 'src/store/all/db';

window.db = function () { return db };

export function getChannel(name: string) {
  return db.channel_db.channel.find(ch => ch.name === name)
}

export function registerNewUser(user: UserStateInterface) {
    db.users_db.users.push(user)
}

export function createNewChannel(channel: ChannelStateInterface) {
    db.channel_db.channel.push(channel);
}

export function deleteChannel(channel: ChannelStateInterface) {
    db.channel_db.channel = db.channel_db.channel.filter(ch => ch.name !== channel.name);
}

export function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
  const ch = db.channel_db.channel.find(ch => ch.name === channel.name);
  if (!ch) return

  ch.members = ch.members.filter(u => u.nickName !== user.nickName);

  const usr = db.users_db.users.find(u => u.user === user)
  if (!usr) return

  usr.channels = usr.channels.filter(c => c.name !== channel.name);
}

export function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
    const ch = db.channel_db.channel.find(ch => ch.name === channel.name);
    if (!ch) return

    ch.members.push(user)

    const usr = db.users_db.users.find(u => u.user === user)
    if (!usr) return

    usr.channels.push(channel)
}

export function saveMessage(message: MessageStateInterface, channel: ChannelStateInterface) {
  return [message, channel]
}

export function verifyUserCredentials(email: string, password: string) {
  const user = db.users_db.users.find(u => u.email === email);
  if (!user) { return false }

  if (user.password !== password) { return false }
  return user
}

export function getAllUsersAsMemberInterface(loggedUser: UserStateInterface): MemberStateInterface[] {
  const usersAsMembers: MemberStateInterface[] = db.users_db.users
    .filter(u => u.user.nickName !== loggedUser.user.nickName)
    .map(u => u.user as MemberStateInterface);

  return usersAsMembers;
}

export function getAllPublicChannels(): ChannelStateInterface[] {
  return db.channel_db.channel.filter(ch => !ch.isPrivate);
}
