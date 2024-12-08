import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/socket.io/:channelName')
  .connected("SocketController.hello")
  .disconnected("SocketController.hello")
  .on("addMessage", "SocketController.addMessage")
  .on("getMessages", "SocketController.getMessages")
  .on("deletedChannel", "SocketController.deletedChannel")
  .on("memberLeftChannel", "SocketController.memberLeftChannel")
  .on("addedMember", "SocketController.addedMember")
  .on("reloadUser", "SocketController.reloadUser")
  .on("typing", "SocketController.typing")
  .on("stopTyping", "SocketController.stopTyping")

  Ws.namespace('/socket.io/user/:userNickname')
  .on("newChannel", "SocketController.inviteUser")
