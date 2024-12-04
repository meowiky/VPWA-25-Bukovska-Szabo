import { DateTime } from 'luxon'
import { afterCreate, BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public channelId: number

  @column.dateTime()
  public sentAt: DateTime

  @column()
  public message: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Channel)
  public channel: BelongsTo<typeof Channel>

  @afterCreate()
  public static async updateChannelLastActive(message: Message) {
    const channel = await Channel.find(message.channelId)
    if (channel) {
      channel.lastActive = message.sentAt
      await channel.save()
    }
  }
}
