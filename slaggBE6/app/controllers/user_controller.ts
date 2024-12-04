import Channel from '#models/channel'
import KickRequest from '#models/kick_request'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Message from '#models/message'

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

  async joinPublicChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName } = request.only(['channelName'])

    try {
      const channel = await Channel.query()
        .where('name', channelName)
        .andWhere('is_private', false)
        .preload('users')
        .first()

      if (!channel) {
        return response.notFound({
          message: `Public channel with name '${channelName}' does not exist or is private.`,
        })
      }

      const isUserAlreadyInChannel = channel.users.some(
        (existingUser) => existingUser.id === user.id
      )
      if (isUserAlreadyInChannel) {
        return response.badRequest({
          message: `You are already a member of the channel '${channelName}'.`,
        })
      }

      await channel.related('users').attach([user.id])

      return response.ok({
        message: `You have successfully joined the channel '${channelName}'.`,
      })
    } catch (error) {
      console.error('Error joining channel:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to join the channel.',
        error: error.message,
      })
    }
  }

  async requestKickUserFromChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const { channelName, userNickName } = request.only(['channelName', 'userNickName'])

    try {
      const channel = await Channel.query()
        .where('name', channelName)
        .preload('admin')
        .preload('users')
        .first()

      if (!channel) {
        return response.notFound({ message: `Channel '${channelName}' does not exist.` })
      }

      if (user.nickname === userNickName) {
        return response.badRequest({ message: 'You cannot request to kick yourself.' })
      }

      if (channel.admin.nickname === userNickName) {
        return response.badRequest({ message: 'You cannot request to kick the admin.' })
      }

      const targetUser = await User.query().where('nickname', userNickName).first()
      if (!targetUser) {
        return response.notFound({ message: `User '${userNickName}' does not exist.` })
      }

      const isRequesterInChannel = await channel
        .related('users')
        .query()
        .where('id', user.id)
        .first()
      if (!isRequesterInChannel) {
        return response.unauthorized({
          message: `You must be a member of the channel '${channelName}' to request a kick.`,
        })
      }

      const isTargetInChannel = await channel
        .related('users')
        .query()
        .where('id', targetUser.id)
        .first()
      if (!isTargetInChannel) {
        return response.badRequest({
          message: `User '${userNickName}' is not a member of the channel.`,
        })
      }

      const existingRequest = await KickRequest.query()
        .where('channelId', channel.id)
        .where('requesterId', user.id)
        .where('targetId', targetUser.id)
        .first()

      if (existingRequest) {
        return response.badRequest({ message: 'You have already requested to kick this user.' })
      }

      await KickRequest.create({
        channelId: channel.id,
        requesterId: user.id,
        targetId: targetUser.id,
        requestedAt: DateTime.now(),
      })

      const kickRequestCount = await KickRequest.query()
        .where('channelId', channel.id)
        .where('targetId', targetUser.id)
        .count('* as total')

      const total = kickRequestCount[0].$extras.total

      if (Number(total) >= 3) {
        await channel.related('users').detach([targetUser.id])
        await KickRequest.query()
          .where('channelId', channel.id)
          .where('targetId', targetUser.id)
          .delete()

        return response.ok({
          message: `User '${userNickName}' has been removed from the channel '${channelName}' due to 3 kick requests.`,
        })
      }

      return response.ok({
        message: `Kick request for '${userNickName}' in channel '${channelName}' has been recorded.`,
      })
    } catch (error) {
      console.error('Error requesting kick from channel:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to request the kick.',
        error: error.message,
      })
    }
  }

  async getMessages({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName } = request.only(['channelName'])

    try {
      const channel = await Channel.query().where('name', channelName).preload('users').first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${channelName}' does not exist.`,
        })
      }

      const isUserInChannel = channel.users.some((u) => u.id === user.id)

      if (!isUserInChannel) {
        return response.forbidden({
          message: `You are not a member of the channel '${channelName}'. Access denied.`,
        })
      }

      const messages = await channel.related('messages').query().preload('user')

      const messageData = messages.map((message) => ({
        id: message.id,
        content: message.message,
        createdAt: message.sentAt,
        user: {
          id: message.user.id,
          nickName: message.user.nickname,
        },
      }))

      return response.ok({
        message: `Messages for channel '${channelName}' retrieved successfully.`,
        data: messageData,
      })
    } catch (error) {
      console.error('Error retrieving messages:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to retrieve messages.',
        error: error.message,
      })
    }
  }

  async saveMessage({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName, message } = request.only(['channelName', 'message'])

    try {
      const channel = await Channel.query().where('name', channelName).first()

      if (!channel) {
        return response.notFound({
          message: `Channel with name '${channelName}' does not exist.`,
        })
      }

      await Message.create({
        userId: user.id,
        channelId: channel.id,
        message,
        sentAt: DateTime.now(),
      })

      return response.ok({
        message: `Message for channel '${channelName}' saved successfully.`,
      })
    } catch (error) {
      console.error('Error saving message:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to save the message.',
        error: error.message,
      })
    }
  }

  async isUserInChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { channelName } = request.only(['channelName'])

    try {
      const channel = await Channel.query().where('name', channelName).preload('users').first()
      if (!channel) {
        return response.notFound({
          message: `Channel with name '${channelName}' does not exist.`,
        })
      }

      const isUserInChannel = channel.users.some((u) => u.id === user.id)

      return response.ok({
        message: `Membership status of '${channelName}' checked successfully.`,
        data: isUserInChannel,
      })
    } catch (error) {
      console.error('Error checking if user is in channel:', error)
      return response.internalServerError({
        message: 'An error occurred while trying to check if the user is in the channel.',
        error: error.message,
      })
    }
  }

  async cleanupInactiveChannels({ response }: HttpContext) {
    try {
      const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toISO()

      const inactiveChannels = await Channel.query().where('last_active', '<', thirtyDaysAgo)

      if (inactiveChannels.length === 0) {
        return response.ok({
          message: 'No inactive channels to delete.',
        })
      }

      // Delete inactive channels
      for (const channel of inactiveChannels) {
        // Optionally, you can delete the related messages and users as well
        await channel.related('users').detach() // Detach users from the channel
        await channel.related('messages').query().delete() // Delete all channel messages
        await channel.delete() // Delete the channel itself
      }

      return response.ok({
        message: `${inactiveChannels.length} inactive channels have been deleted.`,
      })
    } catch (error) {
      console.error('Error cleaning up inactive channels:', error)
      return response.internalServerError({
        message: 'Failed to clean up inactive channels.',
        error: error.message,
      })
    }
  }
}