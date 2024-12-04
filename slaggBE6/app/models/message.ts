import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, afterCreate } from '@adonisjs/lucid/orm'
import User from './user.ts'
import Channel from './channel.ts'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public channelId!: number

  @column.dateTime()
  public sentAt!: DateTime

  @column()
  public message!: string

  @belongsTo(() => User)
  public user!: relations.BelongsTo<typeof User>

  @belongsTo(() => Channel)
  public channel!: relations.BelongsTo<typeof Channel>

  @afterCreate()
  public static async updateChannelLastActive(message: Message) {
    const channel = await Channel.find(message.channelId)
    if (channel) {
      channel.lastActive = message.sentAt
      await channel.save()
    }
  }
}
