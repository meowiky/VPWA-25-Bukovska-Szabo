import vine from '@vinejs/vine'

const password = vine.string().minLength(3)

export const registerValidator = vine.compile(
  vine.object({
    nickname: vine.string(),
    surname: vine.string().optional(),
    name: vine.string().optional(),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const match = await db.from('users').select('id').where('email', value).first()
        return !match
      }),
    password,
    state: vine.string().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
  })
)
