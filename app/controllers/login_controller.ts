import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async index({ view }: HttpContext) {
    return await view.render('pages/login')
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    return response.redirect().toRoute('dashboard.index')
  }
}
