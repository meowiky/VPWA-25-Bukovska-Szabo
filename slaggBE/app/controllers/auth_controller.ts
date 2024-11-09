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

    await authenticatedUser.load('channels')

    return {
      user: {
        id: authenticatedUser.id,
        nickname: authenticatedUser.nickname,
        surname: authenticatedUser.surname,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        state: authenticatedUser.state,
        registeredAt: authenticatedUser.registeredAt,
        lastActiveState: authenticatedUser.lastActiveState,
        channels: authenticatedUser.channels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          visibility: channel.visibility,
          lastActive: channel.lastActive,
          admin: channel.admin
            ? {
                id: channel.admin.id,
                nickname: channel.admin.nickname,
                email: channel.admin.email,
              }
            : null,
        })),
      },
    }
  }
}
