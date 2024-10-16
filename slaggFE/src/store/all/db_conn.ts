import {ChannelStateInterface, MemberStateInterface, UserStateInterface} from './state';
import * as db from 'src/store/all/db';

window.db = function () { return db };

export function getChannel(name: string) {
    const entry = db.channel_db.channel.find(ch => ch.name === name);
    if (!entry) {
        return null;
    }

    const adminEntry = db.users_db.users.filter(u => u.id === entry.adminId)[0];
    if (!adminEntry) {
        return null;
    }

    const channel: ChannelStateInterface = {
        name: entry.name,
        isPrivate: entry.visibility === 'private',
        admin: {
            firstName: adminEntry.firstName,
            lastName: adminEntry.lastName,
            nickName: adminEntry.nickName,
            status: 'online' // TODO:: Fix?
        },
        members: [],
        messages: []
    }
    return channel
}

export function registerNewUser(user: UserStateInterface) {
    db.users_db.users.push({
        id: db.users_db.users.length + 1,
        nickName: user.user.nickName,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        email: user.email,
        password: user.password,
        registeredAt: Date.now().toString(),
        state: user.user.status,
        lastActiveState: 'online'
    })
}

export function createNewChannel(channel: ChannelStateInterface) {
    const admin = db.users_db.users.filter(u => u.nickName === channel.admin.nickName)[0]
    const adminId = admin ? admin.id : 0


    db.channel_db.channel.push({
        id: db.channel_db.channel.length + 1,
        name: channel.name,
        visibility: channel.isPrivate ? 'private' : 'public',
        adminId: adminId,
        lastActive: Date.now().toString()
    });
}

export function deleteChannel(channel: ChannelStateInterface) {
    db.channel_db.channel = db.channel_db.channel.filter(ch => ch.name !== channel.name);
}

export function removeUserFromChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
    const memberId = db.users_db.users.filter(u => u.nickName === user.nickName)[0].id;
    const channelId = db.channel_db.channel.filter(c => c.name === channel.name)[0].id;
    db.messagesChannel_db.membersChannel = db.messagesChannel_db.membersChannel.filter(mc => mc.memberId !== memberId && mc.channelId !== channelId);
}

export function addUserToChannel(user: MemberStateInterface, channel: ChannelStateInterface) {
    db.messagesChannel_db.membersChannel.push({
        memberId: db.users_db.users.filter(u => u.nickName === user.nickName)[0].id,
        channelId: db.channel_db.channel.filter(c => c.name === channel.name)[0].id
    })
}
