import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.ts'
import Message from './message.ts'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public name!: string

  @column()
  public visibility!: string

  @column()
  public adminId!: number

  @column.dateTime()
  public lastActive!: DateTime

  @belongsTo(() => User)
  public admin!: relations.BelongsTo<typeof User>

  @hasMany(() => Message)
  public messages!: relations.HasMany<typeof Message>

  @manyToMany(() => User)
  public users!: relations.ManyToMany<typeof User>
}
