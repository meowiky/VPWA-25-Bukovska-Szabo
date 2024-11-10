import Channel from '#models/channel'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  async createNewChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!

    try {
      const { name, isPrivate } = request.only(['name', 'isPrivate'])

      const channel = await Channel.create({
        name,
        isPrivate,
        adminId: user.id,
      })
      await channel.related('users').attach([user.id])

      return response.created({
        message: 'Channel created successfully',
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      return response.badRequest({
        message: 'Failed to create channel',
        error: error.message,
      })
    }
  }

  async deleteChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { name } = request.only(['name'])

    try {
      const channel = await Channel.query().where('name', name).first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${name}' does not exist.`,
        })
      }

      if (channel.adminId !== user.id) {
        return response.forbidden({
          message: 'You are not authorized to delete this channel.',
        })
      }

      await channel.related('users').detach()

      await channel.related('messages').query().delete()

      await channel.delete()

      return response.ok({
        message: `Channel '${name}' has been successfully deleted.`,
      })
    } catch (error) {
      console.error('Error deleting channel:', error)
      return response.internalServerError({
        message: 'Failed to delete the channel.',
        error: error.message,
      })
    }
  }

  async leaveChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { name } = request.only(['name'])

    try {
      const channel = await Channel.query().where('name', name).preload('users').first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${name}' does not exist.`,
        })
      }

      const isUserInChannel = channel.users.some((u) => u.id === user.id)

      if (!isUserInChannel) {
        return response.forbidden({
          message: `You are not a member of the channel '${name}'.`,
        })
      }

      if (channel.adminId === user.id) {
        await channel.related('users').detach()
        await channel.delete()
        return response.ok({
          message: `Channel '${name}' has been deleted.`,
        })
      } else {
        await channel.related('users').detach([user.id])
        return response.ok({
          message: `You have left the channel '${name}'.`,
        })
      }
    } catch (error) {
      console.error('Error leaving channel:', error)
      return response.internalServerError({
        message: 'An error occurred while attempting to leave the channel.',
      })
    }
  }

  async kickUserFromChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const { channelName, userNickName } = request.only(['channelName', 'userNickName'])

    try {
      const channel = await Channel.query()
        .where('name', channelName)
        .preload('admin')
        .preload('users', (query) => {
          query.where('nickname', userNickName)
        })
        .first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${channelName}' does not exist.`,
        })
      }

      if (channel.adminId !== user.id) {
        return response.unauthorized({
          message: 'Only the channel admin can kick members.',
        })
      }

      if (user.nickname === userNickName) {
        return response.badRequest({
          message: 'You cannot kick yourself from the channel.',
        })
      }

      const userToKick = await User.query().where('nickname', userNickName).first()

      if (!userToKick) {
        return response.notFound({
          message: `User with nickname '${userNickName}' does not exist.`,
        })
      }

      const isUserInChannel = await channel
        .related('users')
        .query()
        .where('users.id', userToKick.id)
        .first()

      if (!isUserInChannel) {
        return response.notFound({
          message: `User '${userNickName}' is not a member of the channel.`,
        })
      }

      await channel.related('users').detach([userToKick.id])

      return response.ok({
        message: `User '${userNickName}' has been kicked from the channel '${channelName}'.`,
      })
    } catch (error) {
      console.error('Error kicking user from channel:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to kick the user from the channel.',
        error: error.message,
      })
    }
  }

  async addUserToChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName, userNickName } = request.only(['channelName', 'userNickName'])
    console.log(channelName, userNickName)

    try {
      const channel = await Channel.query().where('name', channelName).preload('admin').first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${channelName}' does not exist.`,
        })
      }

      if (channel.isPrivate && channel.adminId !== user.id) {
        return response.unauthorized({
          message: 'Only the admin can add users to a private channel.',
        })
      }

      const userToAdd = await User.query().where('nickname', userNickName).first()

      if (!userToAdd) {
        return response.notFound({
          message: `User with nickname '${userNickName}' does not exist.`,
        })
      }

      const isUserAlreadyInChannel = await channel
        .related('users')
        .query()
        .where('users.id', userToAdd.id)
        .first()
      if (isUserAlreadyInChannel) {
        return response.badRequest({
          message: `User '${userNickName}' is already a member of the channel '${channelName}'.`,
        })
      }

      await channel.related('users').attach([userToAdd.id])

      return response.ok({
        message: `User '${userNickName}' has been added to the channel '${channelName}'.`,
      })
    } catch (error) {
      console.error('Error adding user to channel:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to add the user to the channel.',
        error: error.message,
      })
    }
  }
}
