import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/socket.io')
  .connected("SocketController.hello")
  .disconnected("SocketController.hello")
