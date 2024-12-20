import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class RegisterValidator {
  public schema = schema.create({
    nickname: schema.string(),
    surname: schema.string(),
    name: schema.string(),
    email: schema.string({}, [
      rules.email(),
      rules.normalizeEmail({ allLowercase: true }),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.minLength(3)]),
  })

  public messages = {
    'email.unique': 'The email is already in use',
    'password.minLength': 'Password must be at least 3 characters long',
  }
}
