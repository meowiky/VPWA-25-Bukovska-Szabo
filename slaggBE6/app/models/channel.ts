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

  @column({ columnName: 'is_private' })
  public isPrivate!: boolean

  @column.dateTime()
  public lastActive!: DateTime

  @column()
  public adminId!: number

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  public admin!: relations.BelongsTo<typeof User>

  @hasMany(() => Message)
  public messages!: relations.HasMany<typeof Message>

  @manyToMany(() => User, {
    pivotTable: 'channel_user_pivots',
  })
  public users!: relations.ManyToMany<typeof User>
}
