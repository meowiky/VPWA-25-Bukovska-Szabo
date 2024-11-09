/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import User from '#models/user'
import Channel from '#models/channel'
import Message from '#models/message'

// Get users
router.get('/users', async () => {
  return User.all()
})

// Create user
router.post('/users', async ({ request }) => {
  return await User.create(request.all())
})

// Update user
router.put('/users/:id', async ({ request, params }) => {
  const user = await User.findOrFail(params.id)
  user.merge(request.all())
  await user.save()
  return user
})

// Delete user
router.delete('/users/:id', async ({ params }) => {
  const user = await User.findOrFail(params.id)
  await user.delete()
  return user
})

// Get channels
router.get('/channels', async () => {
  return Channel.all()
})

// Create channel
router.post('/channels', async ({ request }) => {
  return await Channel.create(request.all())
})

// Update channel
router.put('/channels/:id', async ({ request, params }) => {
  const channel = await Channel.findOrFail(params.id)
  channel.merge(request.all())
  await channel.save()
  return channel
})

// Delete channel
router.delete('/channels/:id', async ({ params }) => {
  const channel = await Channel.findOrFail(params.id)
  await channel.delete()
  return channel
})

// Get messages
router.get('/messages', async () => {
  return Message.all()
})

// Create message
router.post('/messages', async ({ request }) => {
  return await Message.create(request.all())
})

// Update message
router.put('/messages/:id', async ({ request, params }) => {
  const message = await Message.findOrFail(params.id)
  message.merge(request.all())
  await message.save()
  return message
})

// Delete message
router.delete('/messages/:id', async ({ params }) => {
  const message = await Message.findOrFail(params.id)
  await message.delete()
  return message
})
