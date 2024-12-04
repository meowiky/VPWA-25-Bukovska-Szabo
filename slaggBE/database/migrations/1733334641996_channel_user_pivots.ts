import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ChannelUserPivots extends BaseSchema {
  protected tableName = 'channel_user_pivots'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.primary(['channel_id', 'user_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
