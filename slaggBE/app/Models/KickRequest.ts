import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'

export default class KickRequest extends BaseModel {
  @column({ isPrimary: true, columnName: 'channel_id' })
  public channelId: number

  @column({ isPrimary: true, columnName: 'requester_id' })
  public requesterId: number

  @column({ isPrimary: true, columnName: 'target_id' })
  public targetId: number

  @column.dateTime()
  public requestedAt: DateTime

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>

  @belongsTo(() => User, {
    foreignKey: 'requesterId',
  })
  public requester: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'targetId',
  })
  public target: BelongsTo<typeof User>
}
