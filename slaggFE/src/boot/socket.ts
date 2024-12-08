import { boot } from 'quasar/wrappers'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3333', {
  path: '/socket.io',
  autoConnect: false,
})

socket.on('connect', () => {
  console.log('Socket connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('Socket disconnected')
})

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err)
})


socket.on('connect_timeout', () => {
  console.error('Socket connection timeout')
})


export default boot(({ app }) => {
  app.config.globalProperties.$socket = socket
})

export { socket }
