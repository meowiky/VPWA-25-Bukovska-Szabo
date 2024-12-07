import {Manager, Socket} from 'socket.io-client';


export class SocketService {
  sockets: Record<string, Socket> = {}

  manager: Manager

  path = '/socket.io'

  constructor() {
    this.manager = new Manager('http://localhost:3333', {
      autoConnect: false,
      withCredentials: true,
      path: this.path
    });
  }

  connect(channelName: string, token: string) {
    if (!this.sockets[channelName]) {
      this.sockets[channelName] = this.manager.socket(`${this.path}/${channelName}`, {
        auth: {token: token}
      })
    }
    if (!this.sockets[channelName].connected) {
      this.sockets[channelName].connect();
    }

    this.sockets[channelName].on('connect', () => {
      console.log('Socket connected:', this.sockets[channelName])
    })

    this.sockets[channelName].on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.sockets[channelName].on('connect_error', (err) => {
      console.error('Socket connection error:', err)
    })

    this.sockets[channelName].on('connect_timeout', () => {
      console.error('Socket connection timeout')
    })

    return this.sockets[channelName]
  }

  disconnect(channelName: string) {
    if (this.sockets[channelName]) {
      if (this.sockets[channelName].connected) {
        this.sockets[channelName].disconnect();
      }
    }
  }

  delete(channelName: string) {
    if (this.sockets[channelName]) {
      if (this.sockets[channelName].connected) {
        this.sockets[channelName].disconnect();
      }
      delete this.sockets[channelName];
    }
  }

  deleteAll() {
    for (const channelName in this.sockets) {
      delete this.sockets[channelName];
    }
  }

}

const socketService = new SocketService()

export default socketService
