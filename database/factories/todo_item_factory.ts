import factory from '@adonisjs/lucid/factories'
import TodoItem from '#models/todo_item'

export const TodoItemFactory = factory
  .define(TodoItem, async ({ faker }) => {
    return {
      description: faker.lorem.sentence(),
      completed: false,
    }
  })
  .state('completed', (todo) => (todo.completed = true))
  .build()
