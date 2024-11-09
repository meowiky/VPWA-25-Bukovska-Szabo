import router from '@adonisjs/core/services/router'
import User from '#models/user'
import Channel from '#models/channel'
import Message from '#models/message'

router
  .group(() => {
    // Get users
    router.get('/users', async () => {
      return User.all()
    })

    // Create user (register new user)
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

    // Get a channel by name
    router.get('/channels/:name', async ({ params }) => {
      const channel = await Channel.query().where('name', params.name).first()
      if (!channel) {
        return { message: 'Channel not found' }
      }
      return channel
    })

    // Get all channels
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

    // Delete channel by name
    router.delete('/channels/:name', async ({ params }) => {
      const channel = await Channel.query().where('name', params.name).first()
      if (!channel) {
        return { message: 'Channel not found' }
      }
      await channel.delete()
      return { message: 'Channel deleted' }
    })

    // Add user to channel
    router.post('/channels/:name/add-user', async ({ request, params }) => {
      const { user } = request.all()
      const channel = await Channel.query().where('name', params.name).first()

      if (!channel) {
        return { message: 'Channel not found' }
      }

      // Add user to the channel (assuming user is stored in the User model)
      const userInstance = await User.findByOrFail('nickName', user.nickName)
      await channel.related('users').attach([userInstance.id])
      return { message: 'User added to channel', channel }
    })

    // Remove user from channel
    router.post('/channels/:name/remove-user', async ({ request, params }) => {
      const { user } = request.all()
      const channel = await Channel.query().where('name', params.name).first()

      if (!channel) {
        return { message: 'Channel not found' }
      }

      // Remove user from the channel
      const userInstance = await User.findByOrFail('nickName', user.nickName)
      await channel.related('users').detach([userInstance.id])
      return { message: 'User removed from channel', channel }
    })

    // Get all public channels
    router.get('/channels/public', async () => {
      return await Channel.query().where('isPrivate', false).exec()
    })

    // Get messages
    router.get('/messages', async () => {
      return Message.all()
    })

    // Create message
    router.post('/messages', async ({ request }) => {
      const { message, channelName } = request.all()
      const channel = await Channel.query().where('name', channelName).first()

      if (!channel) {
        return { message: 'Channel not found' }
      }

      const newMessage = await Message.create({ ...message, channel_id: channel.id })
      return { message: newMessage, channel }
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
      return { message: 'Message deleted' }
    })

    // Verify user credentials (login)
    router.post('/login', async ({ request }) => {
      const { email, password } = request.all()

      const user = await User.query().where('email', email).first()
      if (!user || user.password !== password) {
        return { message: 'Invalid credentials' }
      }

      return user
    })

    router.get('/users/members', async ({ request }) => {
      const { loggedUser } = request.all()
      return await User.query().where('nickName', '!=', loggedUser.nickName).exec()
    })
  })
  .prefix('/api')

export default router
