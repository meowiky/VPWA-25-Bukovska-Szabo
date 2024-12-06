import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('channel_id').unsigned().references('id').inTable('channels').onDelete('CASCADE') 
      table.timestamp('sent_at', { useTz: true }).defaultTo(this.now())
      table.text('message').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
