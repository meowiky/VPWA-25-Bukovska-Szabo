import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'kick_requests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('channel_id')
        .unsigned()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('requester_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('target_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('requested_at', { useTz: true }).defaultTo(this.now())

      table.primary(['channel_id', 'requester_id', 'target_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
