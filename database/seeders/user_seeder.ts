import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.with('todos', 10, (todo) => todo.apply('completed'))
      .with('todos', 20)
      .createMany(10)
  }
}
