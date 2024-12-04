import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import KickRequest from 'App/Models/KickRequest'
import User from 'App/Models/User'
import LoginValidator from 'App/validators/LoginValidator'
import RegisterValidator from 'App/validators/RegisterValidator'

export default class AuthController {
  async register({ request, auth }: HttpContextContract) {
    const data = await request.validate(RegisterValidator)
    const user = await User.create(data)

    const token = await auth.use('api').generate(user)
    return token;
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    try {
      const token = await auth.use('api').attempt(email, password)

      return response.ok({
        message: 'Login successful',
        token,
      })
    } catch {
      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    try {
      await auth.check()

      const authenticatedUser = auth.user as User | undefined
      if (!authenticatedUser) {
        return response.unauthorized({ message: 'User not authenticated' })
      }

      await authenticatedUser.load('channels', (channelQuery) => {
        channelQuery.preload('users').preload('admin')
      })

      const kickRequests = await KickRequest.query()
        .whereIn(
          'channelId',
          authenticatedUser.channels.map((channel) => channel.id)
        )
        .preload('requester')
        .preload('target')

      const kickRequestsByChannelAndUser = kickRequests.reduce(
        (acc, kickRequest) => {
          const channelId = kickRequest.channelId
          const targetId = kickRequest.targetId
          if (!acc[channelId]) {
            acc[channelId] = {}
          }
          if (!acc[channelId][targetId]) {
            acc[channelId][targetId] = []
          }
          acc[channelId][targetId].push({
            requesterNickName: kickRequest.requester.nickname,
          })
          return acc
        },
        {} as Record<number, Record<number, { requesterNickName: string }[]>>
      )

      const allPublicChannels = await Channel.query().where('is_private', false)

      const allUsers = await User.query()
        .whereNot('id', authenticatedUser.id)
        .select('name', 'surname', 'nickname', 'state')

      return {
        user: {
          id: authenticatedUser.id,
          nickName: authenticatedUser.nickname,
          surname: authenticatedUser.surname,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          state: authenticatedUser.state,
          registeredAt: authenticatedUser.registeredAt,
          lastActiveState: authenticatedUser.lastActiveState,
          channels: authenticatedUser.channels.map((channel) => ({
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            lastActive: channel.lastActive,
            admin: channel.admin
              ? {
                  id: channel.admin.id,
                  nickName: channel.admin.nickname,
                  email: channel.admin.email,
                }
              : null,
            users: channel.users.map((user) => ({
              id: user.id,
              nickName: user.nickname,
              email: user.email,
              state: user.state,
              kickRequests:
                kickRequestsByChannelAndUser[channel.id]?.[user.id] || [],
            })),
          })),
        },
        allPublicChannels: allPublicChannels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.isPrivate,
          lastActive: channel.lastActive,
        })),
        allUsers: allUsers.map((user) => ({
          firstName: user.name,
          lastName: user.surname,
          nickName: user.nickname,
          status: user.state as 'online' | 'DND' | 'offline',
        })),
      }
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred',
        error: error.message,
      })
    }
  }

}
