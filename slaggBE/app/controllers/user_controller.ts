import Channel from '#models/channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  async createNewChannel({ auth, request, response }: HttpContext) {
    const user = auth.user!

    try {
      const { name, visibility } = request.only(['name', 'visibility'])

      const channel = await Channel.create({
        name,
        visibility,
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
}
