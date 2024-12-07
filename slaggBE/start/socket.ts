import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/socket.io/:channelName')
  .connected("SocketController.hello")
  .disconnected("SocketController.hello")
  .on("addMessage", "SocketController.addMessage")
  .on("getMessages", "SocketController.getMessages")
