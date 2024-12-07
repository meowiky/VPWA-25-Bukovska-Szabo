import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Message from './Message'
import Channel from './Channel'

export enum UserState {
  ONLINE = 'online',
  DND = 'DND',
  OFFLINE = 'offline',
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nickname: string

  @column()
  public surname: string

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public state: UserState;

  @column.dateTime()
  public registeredAt: DateTime

  @column.dateTime()
  public lastActiveState: DateTime

  @hasMany(() => Message, {
    foreignKey: 'userId',
  })
  public messages: HasMany<typeof Message>

  @manyToMany(() => Channel, {
    pivotTable: 'channel_user_pivots',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id',
  })
  public channels: ManyToMany<typeof Channel>

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
