/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LoginController = () => import('#controllers/login_controller')
const LogoutController = () => import('#controllers/logout_controller')
const DashboardController = () => import('#controllers/dashboard_controller')

router
  .get('/', async ({ response }) => {
    response.redirect().toRoute('login.index')
  })
  .as('home')

router
  .group(() => {
    router.get('/', [LoginController, 'index']).as('index')
    router.post('/', [LoginController, 'store']).as('store')
  })
  .as('login')
  .prefix('/login')
  .use(middleware.guest())

router.post('/logout', [LogoutController, 'destroy']).as('logout')

router
  .group(() => {
    router.get('/', [DashboardController, 'index']).as('index')

    router.get('/create', [DashboardController, 'create']).as('create')
    router.post('/create', [DashboardController, 'store']).as('store')

    router.get('/:id', [DashboardController, 'show']).as('show')
    router.post('/:id', [DashboardController, 'update']).as('update')
    router.delete('/:id', [DashboardController, 'destroy']).as('destroy')
  })
  .as('dashboard')
  .prefix('/dashboard')
  .use(middleware.auth())
