import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class LoginValidator {
  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.normalizeEmail({ allLowercase: true }),
    ]),
    password: schema.string({}, [
      rules.minLength(3),
    ]),
  })

  public messages = {
    'email.required': 'Email is required',
    'email.email': 'Provide a valid email address',
    'password.required': 'Password is required',
    'password.minLength': 'Password must be at least 3 characters long',
  }
}
