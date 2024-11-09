import router from '@adonisjs/core/services/router'
import User from '#models/user'
import Channel from '#models/channel'
import Message from '#models/message'
import { middleware } from './kernel.ts'
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.post('/login', [AuthController, 'login']).as('auth.login')
    router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
    router.get('/me', [AuthController, 'me']).as('auth.me')
  })
  .prefix('/api')

export default router
