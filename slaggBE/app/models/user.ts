import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Channel from './channel.ts'
import Message from './message.ts'
import * as relations from '@adonisjs/lucid/types/relations'

export default class User extends BaseModel {
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

  @column()
  public password!: string

  @column()
  public state!: string

  @column.dateTime()
  public registeredAt!: DateTime

  @column.dateTime()
  public lastActiveState!: DateTime

  @hasMany(() => Channel)
  public channels!: relations.HasMany<typeof Channel>

  @hasMany(() => Message)
  public messages!: relations.HasMany<typeof Message>
}
