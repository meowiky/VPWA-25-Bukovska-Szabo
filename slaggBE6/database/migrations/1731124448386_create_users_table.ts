import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nickname').notNullable()
      table.string('surname')
      table.string('name')
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.timestamp('registered_at').defaultTo(this.now())
      table.string('state')
      table.timestamp('last_active_state')

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
