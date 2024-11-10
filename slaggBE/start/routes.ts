import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'
const AuthController = () => import('#controllers/auth_controller')
const UserController = () => import('#controllers/user_controller')

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.post('/login', [AuthController, 'login']).as('auth.login')
    router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
    router.get('/me', [AuthController, 'me']).as('auth.me')
    router
      .post('/createChannel', [UserController, 'createNewChannel'])
      .as('user.createNewChannel')
      .use(middleware.auth())
    router
      .delete('/deleteChannel', [UserController, 'deleteChannel'])
      .as('user.deleteChannel')
      .use(middleware.auth())
    router
      .delete('/leaveChannel', [UserController, 'leaveChannel'])
      .as('user.leaveChannel')
      .use(middleware.auth())
    router
      .delete('/kickUserFromChannel', [UserController, 'kickUserFromChannel'])
      .as('user.kickUserFromChannel')
      .use(middleware.auth())
    router
      .post('/addUserToChannel', [UserController, 'addUserToChannel'])
      .as('user.addUserToChannel')
      .use(middleware.auth())
    router
      .post('/joinPublicChannel', [UserController, 'joinPublicChannel'])
      .as('user.joinPublicChannel')
      .use(middleware.auth())
  })
  .prefix('/api')

export default router
