import { schema, rules } from '@ioc:Adonis/Core/Validator'

const passwordRules = schema.string({}, [
  rules.minLength(3),
])

export const registerValidator = schema.create({
  nickname: schema.string(),
  surname: schema.string.optional(),
  name: schema.string.optional(),
  email: schema.string({}, [
    rules.email(),
    rules.normalizeEmail({ allLowercase: true }),
    rules.unique({ table: 'users', column: 'email' }),
  ]),
  password: passwordRules,
  state: schema.string.optional(),
})

export const loginValidator = schema.create({
  email: schema.string({}, [
    rules.email(),
    rules.normalizeEmail({ allLowercase: true }),
  ]),
  password: passwordRules,
})
