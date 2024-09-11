import express from 'express'
import 'express-async-errors'
import errorHandler from '../helpers/error_handler.js'
import orderRoutes from '../routes/order.js'

/**
 * Express configuration
 */

export async function configure (app) {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use('/', orderRoutes)
    app.use(errorHandler)
    console.log('Express configured.')
}