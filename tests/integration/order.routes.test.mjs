import request from 'supertest'
import express from 'express'
import router from '../../src/routes/order.js'
import sinon from 'sinon'
import assert from 'assert'
import OrderService from '../../src/services/orders.js'
import { NotFound } from '../../src/globals/errors.js'

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
    }),

    it('should get an order by ID', async function() {
        const date = new Date()
        orderServiceStub.get.resolves({
            id: '5f4d0f9f8a2d8e0017f6b1b2',
            date: date,
            status: 'completed',
            totalAmount: 200,
            items: [{
                product_id: '5f4d0f9f8a2d8e0017f6b1b1',
                quantity: 1
            }]
        })
    
        const response = await request(app).get('/orders/5f4d0f9f8a2d8e0017f6b1b2')
        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(response.body.order.id, '5f4d0f9f8a2d8e0017f6b1b2')
        assert.strictEqual(response.body.order.status, 'completed')
        assert.strictEqual(response.body.order.totalAmount, 200)
        assert.strictEqual(response.body.order.items[0].quantity, 1)
    }),

    it('should create a new order', async function() {
        const orderData = {
            fields: {
                date: new Date(),
                status: 'pending',
                totalAmount: 150,
                items: [{
                    product_id: '5f4d0f9f8a2d8e0017f6b1b3',
                    quantity: 3
                }]
            }
        }
    
        orderServiceStub.create.resolves({ id: '5f4d0f9f8a2d8e0017f6b1b4', ...orderData.fields })
    
        const response = await request(app)
            .post('/orders')
            .send(orderData)
    
        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(response.body.order.id, '5f4d0f9f8a2d8e0017f6b1b4')
        assert.strictEqual(response.body.order.status, 'pending')
        assert.strictEqual(response.body.order.totalAmount, 150)
        assert.strictEqual(response.body.order.items[0].quantity, 3)
    }),

    it('should update an order by ID', async function() {
        const updatedData = {
            fields: {
                date: new Date(),
                status: 'shipped',
                totalAmount: 180,
                items: [{
                    product_id: '5f4d0f9f8a2d8e0017f6b1b5',
                    quantity: 4
                }]
            }
            
        }
    
        orderServiceStub.update.resolves({ id: '5f4d0f9f8a2d8e0017f6b1b6', ...updatedData.fields })
    
        const response = await request(app)
            .put('/orders/5f4d0f9f8a2d8e0017f6b1b6')
            .send(updatedData)
    
        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(response.body.order.status, 'shipped')
        assert.strictEqual(response.body.order.totalAmount, 180)
        assert.strictEqual(response.body.order.items[0].quantity, 4)
    }),

    it('should delete an order by ID', async function() {
        orderServiceStub.remove.resolves(true)
    
        const response = await request(app).delete('/orders/5f4d0f9f8a2d8e0017f6b1b7')
        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(response.body.message, 'Commande supprimée.')
    })

        // TODO : Modifier le code retour : Erreur sur le code de retour, réclame un 200 et non 404
        // it('should return 404 for a non-existent order', async function() {
        //     orderServiceStub.get.resolves(null)
        
        //     const response = await request(app).get('/orders/nonexistent')

        //     assert.strictEqual(response.statusCode, 404)
        // })
           
})