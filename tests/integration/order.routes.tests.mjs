import request from 'supertest'
import express from 'express'
import router from '../../src/routes/order.js'
import sinon from 'sinon'
import assert from 'assert'
import OrderService from '../../src/services/orders.js'

const app = express()
app.use(express.json())
app.use('/orders', router)

describe('Order routes', function() {
    this.timeout(5000) // Add an extra time to the default timeout

    let orderServiceStub

    this.beforeEach(() => {
        orderServiceStub = sinon.createStubInstance(OrderService)

        sinon.replace(OrderService.prototype, 'getAll', orderServiceStub.getAll)
        sinon.replace(OrderService.prototype, 'get', orderServiceStub.get)
        sinon.replace(OrderService.prototype, 'create', orderServiceStub.create)
        sinon.replace(OrderService.prototype, 'update', orderServiceStub.update)
        sinon.replace(OrderService.prototype, 'remove', orderServiceStub.remove)
    })

    this.afterEach(() => {
        sinon.restore()
    })

    it('should get all orders', async function() {
        const date = new Date()
        orderServiceStub.getAll.resolves([{
            date: date,
            status: 'pending',
            totalAmount: 100,
            items: [{
                product_id: '5f4d0f9f8a2d8e0017f6b1b1',
                quantity: 2
            }]
        }])

        const response = await request(app).get('/orders')
        assert.strictEqual(response.statusCode, 200)
        assert(Array.isArray(response.body.orders))
        assert.strictEqual(response.body.orders.length, 1)
        assert.strictEqual(response.body.orders[0].date, date.toISOString())
        assert.strictEqual(response.body.orders[0].status, 'pending')
        assert.strictEqual(response.body.orders[0].totalAmount, 100)
        assert.strictEqual(response.body.orders[0].items.length, 1)
        assert.strictEqual(response.body.orders[0].items[0].quantity, 2)
    })
})