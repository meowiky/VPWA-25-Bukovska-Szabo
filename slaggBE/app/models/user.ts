import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Channel from './channel.ts'
import Message from './message.ts'
import * as relations from '@adonisjs/lucid/types/relations'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public nickname!: string

  @column()
  public surname!: string

  @column()
  public name!: string

  @column()
  public email!: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  public state!: string

  @column.dateTime()
  public registeredAt!: DateTime

  @column.dateTime()
  public lastActiveState!: DateTime

  @hasMany(() => Message)
  public messages!: relations.HasMany<typeof Message>

  @manyToMany(() => Channel, {
    pivotTable: 'channel_user_pivots',
  })
  public channels!: relations.ManyToMany<typeof Channel>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
