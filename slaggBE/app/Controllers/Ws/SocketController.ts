import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import Channel from "App/Models/Channel";
import KickRequest from 'App/Models/KickRequest';
import Message from "App/Models/Message";
import User from 'App/Models/User';
import {DateTime} from "luxon";

export default class SocketController {
  public async hello({ socket, params, auth }: WsContextContract) {
    console.log(params.channelName)

    const authenticatedUser = auth.user as User | undefined
    if (!authenticatedUser) {
      socket.emit('channel', null)
      return
    }

    const channel = await Channel.query()
    .where('name', params.channelName)
    .preload('admin')
    .preload('users')
    .first();

    if (!channel) {
        socket.emit('channel', null);
        return;
    }

    const kickRequests = await KickRequest.query()
    .where('channelId', channel.id)
    .preload('requester');

    const kickRequestsByUser = kickRequests.reduce((acc, kickRequest) => {
      if (!acc[kickRequest.targetId]) {
        acc[kickRequest.targetId] = [];
      }
      acc[kickRequest.targetId].push({
        requesterNickName: kickRequest.requester.nickname,
      });
      return acc;
    }, {} as Record<number, { requesterNickName: string }[]>);

    const formattedChannel = {
      admin: {
        id: channel.admin.id,
        email: channel.admin.email,
        nickName: channel.admin.nickname,
        kickRequests: [],
        status: channel.admin.state,
      },
      id: channel.id,
      isPrivate: channel.isPrivate,
      lastActive: channel.lastActive,
      name: channel.name,
      users: channel.users.map((user) => ({
        id: user.id,
        email: user.email,
        nickName: user.nickname,
        kickRequests: kickRequestsByUser[user.id] || [],
        status: user.state,
      })),
    };

    socket.emit('channel', formattedChannel)
    
  }

  public async getMessages ({ socket, params }: WsContextContract) {
    const channel = await Channel.query().where('name', params.channelName).preload('users').first()

    if (!channel) {
      socket.emit('loadedMessages', [])
      return
    }

    const messages = await channel.related('messages').query().preload('user')
    const messageData = messages.map((message) => ({
      id: message.id,
      content: message.message,
      sentAt: message.sentAt,
      sender: message.user.nickname
    }))

    socket.emit('loadedMessages', messageData)
  }

  public async addMessage ({ auth, socket, params }: WsContextContract, message: string) {
    const user = auth.user!
    const channel = await Channel.query().where('name', params.channelName).first()

    if (!channel) {
      socket.emit('addMessage', [])
      return
    }

    const newMessage = await Message.create({
      userId: user.id,
      channelId: channel.id,
      message: message,
      sentAt: DateTime.now(),
    })

    await newMessage.load('user')

    const newMessageData = {
      id: newMessage.id,
      content: newMessage.message,
      sentAt: newMessage.sentAt,
      sender: newMessage.user.nickname
    }
    console.log(newMessageData)

    socket.nsp.emit('newMessage', newMessageData)
  }

  public async deletedChannel({socket, params}: WsContextContract) {
    const channel = await Channel.query().where('name', params.channelName).first()
    if (!channel) {
      socket.nsp.emit('deletedChannel', params.channelName)
    }
  }

  public async memberLeftChannel({socket, params}: WsContextContract, memberNickName: string) {
    const channel = await Channel.query().where('name', params.channelName).preload('users').first()
    if (channel) {
      const isMemberInChannel = channel.users.some((user) => user.nickname === memberNickName);
      if (!isMemberInChannel) {
        socket.nsp.emit('memberLeftChannel', memberNickName)
      }
    }
    
  }

  public async addedMember({socket, params}: WsContextContract, memberNickName: string) {
    const channel = await Channel.query().where('name', params.channelName).preload('users').first()
    if (channel) {
      const memberInChannel = channel.users.find((user) => user.nickname === memberNickName);
      if (memberInChannel) {
        const memberData = {
          id: memberInChannel.id,
          email: memberInChannel.email,
          nickName: memberInChannel.nickname,
          kickRequests: [],
          status: memberInChannel.state,
        }
        socket.nsp.emit('addedMember', memberData)
      }
    }
  }

  public async reloadUser({socket, params}: WsContextContract, memberNickName: string) { 
    const channel = await Channel.query().where('name', params.channelName).preload('users').first()
    if (channel) {
      const memberInChannel = channel.users.find((user) => user.nickname === memberNickName);
      if (memberInChannel) {
        const kickrequests = await KickRequest.query()
            .where('channelId', channel.id)
            .andWhere('targetId', memberInChannel.id)
            .preload('requester');

        const formattedKickRequests = kickrequests.map((request) => ({
          requesterNickName: request.requester.nickname,
        }));

        const newMemberData = {
          id: memberInChannel.id,
          email: memberInChannel.email,
          nickName: memberInChannel.nickname,
          kickRequests: formattedKickRequests,
          status: memberInChannel.state,
        }
        socket.nsp.emit('reloadUser', newMemberData);
        
      }
    }
  }

}
