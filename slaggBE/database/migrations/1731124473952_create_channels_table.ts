import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Channels extends BaseSchema {
  protected tableName = 'channels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('visibility').notNullable()
      table.integer('admin_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('last_active')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
