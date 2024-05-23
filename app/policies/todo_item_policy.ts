import User from '#models/user'
import TodoItem from '#models/todo_item'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class TodoItemPolicy extends BasePolicy {
  create(): AuthorizerResponse {
    return true
  }

  show(user: User, item: TodoItem): AuthorizerResponse {
    return user.id === item.userId
  }

  edit(user: User, item: TodoItem): AuthorizerResponse {
    return user.id === item.userId
  }

  delete(user: User, item: TodoItem): AuthorizerResponse {
    return user.id === item.userId
  }
}
