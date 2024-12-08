/**
 * Here you can define options for socket.io server described here
 * https://socket.io/docs/v4/server-options/#socketio-server-options
 */

import type { WsConfig } from '@ioc:Ruby184/Socket.IO/Ws'

const wsConfig: WsConfig = {
  cors: {
    origin: ['http://localhost:9000', "http://localhost:9200"],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'],
    allowedHeaders : '*',
    credentials: true
  }
}

export default wsConfig
