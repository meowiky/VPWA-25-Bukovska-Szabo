/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.delete('/logout', 'AuthController.logout').as('auth.logout').middleware('auth')
  Route.get('/me', 'AuthController.me').as('auth.me')
  Route.get('/users', 'UserController.getAllOtherUsers').as('user.getAllOtherUsers')
  Route.get('/joinable-channels', 'UserController.getJoinablePublicChannels').as('user.getJoinablePublicChannels')
})
.prefix('/api')

Route.group(() => {
  Route.post('/createChannel', 'UserController.createNewChannel').as('user.createNewChannel').middleware('auth')
  Route.delete('/deleteChannel', 'UserController.deleteChannel').as('user.deleteChannel').middleware('auth')
  Route.delete('/leaveChannel', 'UserController.leaveChannel').as('user.leaveChannel').middleware('auth')
  Route.delete('/kickUserFromChannel', 'UserController.kickUserFromChannel').as('user.kickUserFromChannel').middleware('auth')
  Route.post('/addUserToChannel', 'UserController.addUserToChannel').as('user.addUserToChannel').middleware('auth')
  Route.post('/joinPublicChannel', 'UserController.joinPublicChannel').as('user.joinPublicChannel').middleware('auth')
  Route.post('/requestKickUserFromChannel', 'UserController.requestKickUserFromChannel').as('user.requestKickUserFromChannel').middleware('auth')
  Route.get('/messages', 'UserController.getMessages').as('user.getMessages').middleware('auth')
  Route.post('/messages', 'UserController.saveMessage').as('user.saveMessage').middleware('auth')
  Route.get('/isUserInChannel', 'UserController.isUserInChannel').as('user.isUserInChannel').middleware('auth')
  Route.get('/cleanupInactiveChannels', 'UserController.cleanupInactiveChannels').as('user.cleanupInactiveChannels')
})
.prefix('/api')
