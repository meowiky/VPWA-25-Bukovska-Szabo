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
}
