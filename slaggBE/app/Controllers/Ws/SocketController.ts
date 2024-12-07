import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'

export default class SocketController {
  public async hello({ socket }: WsContextContract) {
    socket.emit('hello', 'Hello from server!')
    console.log('hello')
  }
}
