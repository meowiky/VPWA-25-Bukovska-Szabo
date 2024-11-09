import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
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
  public password!: string // TODO:: encrypt

  @column()
  public state!: string

  @column.dateTime()
  public registeredAt!: DateTime

  @column.dateTime()
  public lastActiveState!: DateTime

  @hasMany(() => Message)
  public messages!: relations.HasMany<typeof Message>

  @manyToMany(() => Channel)
  public channels!: relations.ManyToMany<typeof Channel>
}
