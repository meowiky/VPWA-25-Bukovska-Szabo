import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import Channel from "App/Models/Channel";
import Message from "App/Models/Message";
import {DateTime} from "luxon";

export default class SocketController {
  public async hello({ socket }: WsContextContract) {
    socket.emit('hello', 'Hello from server!')
    console.log('hello')
  }

  public async getMessages ({ socket, params }: WsContextContract) {
    const channel = await Channel.query().where('name', params.channelName).preload('users').first()

    if (!channel) {
      socket.emit('channel', [])
      return
    }

    const messages = await channel.related('messages').query().preload('user')
    const messageData = messages.map((message) => ({
      id: message.id,
      content: message.message,
      sentAt: message.sentAt,
      sender: message.user.nickname
    }))

    socket.emit('channel', messageData)
  }

  public async addMessage ({ auth, socket, params }: WsContextContract, message: string) {
    const user = auth.user!
    const channel = await Channel.query().where('name', params.channelName).first()

    if (!channel) {
      socket.emit('addMessage', [])
      return
    }

    const x = await Message.create({
      userId: user.id,
      channelId: channel.id,
      message: message,
      sentAt: DateTime.now(),
    })

    socket.nsp.emit('addMessage', x)
  }
}
