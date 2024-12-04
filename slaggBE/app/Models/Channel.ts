import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Message from './Message'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column({ columnName: 'is_private' })
  public isPrivate: boolean

  @column.dateTime()
  public lastActive: DateTime

  @column()
  public adminId: number

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  public admin: BelongsTo<typeof User>

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>

  @manyToMany(() => User, {
    pivotTable: 'channel_user_pivots',
    pivotRelatedForeignKey: 'user_id',
    pivotForeignKey: 'channel_id',
  })
  public users: ManyToMany<typeof User>
}
