import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nickname', 180).notNullable()
      table.string('surname').nullable()
      table.string('name').nullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.enum('state', ['online', 'DND', 'offline']).defaultTo('offline')
      table.timestamp('registered_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('last_active_state', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
