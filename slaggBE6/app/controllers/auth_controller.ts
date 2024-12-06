import Channel from '#models/channel'
import KickRequest from '#models/kick_request'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create(data)

    return User.accessTokens.create(user)
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    return User.accessTokens.create(user)
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { message: 'success' }
  }

  async me({ auth }: HttpContext) {
    await auth.check()

    const authenticatedUser = auth.user as User | undefined
    if (!authenticatedUser) {
      return
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
            kickRequests: kickRequestsByChannelAndUser[channel.id]?.[user.id] || [],
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
  }
}
