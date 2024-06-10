import TodoItem from '#models/todo_item'
import TodoItemPolicy from '#policies/todo_item_policy'
import { createItemValidator, updateItemValidator } from '#validators/todo_item'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class DashboardController {
  async index({ auth, response, request, view }: HttpContext) {
    if (!auth.user) {
      response.redirect().toRoute('login.index')
    }

    const completed = request.input('completed', undefined)

    const page = request.input('page', 1)
    const limit = 10

    let analytics = {}
    let items

    await db.transaction(async (trx) => {
      const analyticsData = await trx
        .from('todo_items')
        .where('user_id', auth.user!.id)
        .select(
          db.raw('SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_count'),
          db.raw('SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) as not_completed_count')
        )

      analytics = {
        completedCount: analyticsData[0].completed_count,
        notCompletedCount: analyticsData[0].not_completed_count,
        totalCount: analyticsData[0].completed_count + analyticsData[0].not_completed_count,
      }

      if (completed === undefined) {
        items = await trx
          .from('todo_items')
          .where('user_id', auth.user!.id)
          .orderBy('created_at', 'desc')
          .paginate(page, limit)

        items.baseUrl('/dashboard')
      } else {
        items = await trx
          .from('todo_items')
          .where('user_id', auth.user!.id)
          .andWhere('completed', completed === 'true' ? 1 : 0)
          .orderBy('created_at', 'desc')
          .paginate(page, limit)

        items.baseUrl('/dashboard')
      }
    })

    return await view.render('pages/dashboard/index', { analytics, items, completed })
  }

  async create({ view }: HttpContext) {
    return await view.render('pages/dashboard/create')
  }

  async store({ request, response, bouncer, session, auth }: HttpContext) {
    if (!(await bouncer.with(TodoItemPolicy).allows('create'))) {
      return response.unauthorized('Not allowed to create')
    }

    const { description, completed } = await request.validateUsing(createItemValidator)

    const item = new TodoItem()
    await item.merge({ description, completed: completed ?? false }).save()
    await item.related('user').associate(auth.user!)

    session.flash('notification', {
      type: 'success',
      message: 'Item saved successfully',
    })

    return response.redirect().toRoute('dashboard.show', { id: item.id })
  }

  async show({ params, response, view, bouncer }: HttpContext) {
    const itemId = params.id

    if (!itemId) {
      return response.badRequest('Item ID must be provided')
    }

    const item = await TodoItem.find(itemId)

    if (!item) {
      return response.notFound('Item not found')
    }

    if (!(await bouncer.with(TodoItemPolicy).allows('show', item))) {
      return response.unauthorized('Not allowed to view')
    }

    return await view.render('pages/dashboard/show', { item })
  }

  async update({ params, request, response, session, bouncer }: HttpContext) {
    const itemId = params.id

    if (!itemId) {
      return response.badRequest('Item ID must be provided')
    }

    const item = await TodoItem.find(itemId)

    if (!item) {
      return response.notFound('Item not found')
    }

    if (!(await bouncer.with(TodoItemPolicy).allows('edit', item))) {
      return response.unauthorized('Not allowed to update')
    }

    const { description, completed } = await request.validateUsing(updateItemValidator)

    await item.merge({ description, completed: completed ?? false }).save()

    session.flash('notification', {
      type: 'success',
      message: 'Item updated successfully',
    })

    return response.redirect().toRoute('dashboard.show', { id: item.id })
  }

  async destroy({ params, response, bouncer, session }: HttpContext) {
    const itemId = params.id

    if (!itemId) {
      return response.badRequest('Item ID must be provided')
    }

    const item = await TodoItem.find(itemId)

    if (!item) {
      return response.notFound('Item not found')
    }

    if (!(await bouncer.with(TodoItemPolicy).allows('delete', item))) {
      return response.unauthorized('Not allowed to delete')
    }

    await item.delete()

    session.flash('notification', {
      type: 'success',
      message: 'Item deleted successfully',
    })

    return response.redirect().toRoute('dashboard.index')
  }
}
