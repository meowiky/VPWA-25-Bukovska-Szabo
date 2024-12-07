import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
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
        token: token.token,
      })
    } catch {
      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }

  public async logout({ auth }: HttpContextContract) {
    try {
      await auth.use('api').logout()
      return { message: 'Logout successful' }
    }
    catch {
      return { message: 'Logout failed' }
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    try {
      await auth.check()

      const authenticatedUser = auth.user as User | undefined
      if (!authenticatedUser) {
        return response.unauthorized({ message: 'User not authenticated' })
      }

      await authenticatedUser.load('channels')
      const channelNames: string[] = authenticatedUser.channels.map((channel) => channel.name);

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
        },
        channels: channelNames
      }
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred',
        error: error.message,
      })
    }
  }

}
