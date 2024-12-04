import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Channel from './channel.ts'
import User from './user.ts'
import * as relations from '@adonisjs/lucid/types/relations'

export default class KickRequest extends BaseModel {
  @column({ isPrimary: true, columnName: 'channel_id' })
  public channelId!: number

  @column({ isPrimary: true, columnName: 'requester_id' })
  public requesterId!: number

  @column({ isPrimary: true, columnName: 'target_id' })
  public targetId!: number

  @column.dateTime()
  public requestedAt!: DateTime

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel!: relations.BelongsTo<typeof Channel>

  @belongsTo(() => User, {
    foreignKey: 'requesterId',
  })
  public requester!: relations.BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'targetId',
  })
  public target!: relations.BelongsTo<typeof User>
}
