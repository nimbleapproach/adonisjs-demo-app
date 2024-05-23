import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { TodoItemFactory } from '#database/factories/todo_item_factory'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: 'Password@123',
    }
  })
  .relation('todos', () => TodoItemFactory)
  .build()
