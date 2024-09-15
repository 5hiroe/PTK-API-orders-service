import { strict as assert } from 'assert';
import sinon from 'sinon';
import OrderService from '../../src/services/orders.js';
import OrderModel from '../../src/models/order.js';
import { NotFound } from '../../src/globals/errors.js';
import mongoose from 'mongoose';

describe('Order Service', function () {
    let orderService;
    let sandbox;

    before(function () {
        orderService = new OrderService();
    });

    beforeEach(function () {
        // Utilisation d'un sandbox pour gérer tous les stubs
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        // Nettoyage des stubs après chaque test
        sandbox.restore();
    });

    describe('Create Order', function () {
        it('should save an order successfully', async function () {
            const productId = new mongoose.Types.ObjectId();
            const itemId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const orderData = {
                date: new Date(),
                status: 'pending',
                totalAmount: 100,
                items: [{ product_id: productId, quantity: 2 }]
            };

            const savedOrder = { _id: orderId, ...orderData };
            
            // Stub sur l'instance de OrderModel
            const saveStub = sandbox.stub(OrderModel.prototype, 'save').resolves(savedOrder);

            const result = await orderService.create({ fields: orderData });

            assert.strictEqual(result._id instanceof mongoose.Types.ObjectId, true);
            assert.strictEqual(result.items[0]._id instanceof mongoose.Types.ObjectId, true);

            // Comparaison uniquement des champs pertinents
            assert.deepEqual({
                date: result.date.toISOString(),
                status: result.status,
                totalAmount: result.totalAmount,
                items: result.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                }))
            }, {
                date: savedOrder.date.toISOString(),
                status: savedOrder.status,
                totalAmount: savedOrder.totalAmount,
                items: savedOrder.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                }))
            });

            assert(saveStub.calledOnce);
        });
    });

    describe('Get Orders', function () {
        it('should get all orders successfully', async function () {
            const orders = [{
                _id: new mongoose.Types.ObjectId(),
                date: new Date(),
                status: 'pending',
                totalAmount: 100,
                items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
            }];
            
            // Stub sur la méthode find
            const findStub = sandbox.stub(OrderModel, 'find').resolves(orders);

            const result = await orderService.getAll();

            // Comparaison des champs pertinents pour tous les ordres
            const mappedResult = result.map(order => ({
                _id: order._id.toString(),
                date: order.date.toISOString(),
                status: order.status,
                totalAmount: order.totalAmount,
                items: order.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            }));

            const mappedExpected = orders.map(order => ({
                _id: order._id.toString(),
                date: order.date.toISOString(),
                status: order.status,
                totalAmount: order.totalAmount,
                items: order.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            }));

            assert.deepEqual(mappedResult, mappedExpected);
            assert(findStub.calledOnce);
        });

        it('should get an order by id successfully', async function () {
            const orderId = new mongoose.Types.ObjectId();
            const order = {
                _id: orderId,
                date: new Date(),
                status: 'pending',
                totalAmount: 100,
                items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
            };
            
            // Stub sur la méthode findById
            const findByIdStub = sandbox.stub(OrderModel, 'findById').resolves(order);

            const result = await orderService.get({ orderId });

            // Comparaison des champs pertinents
            assert.deepEqual({
                _id: result._id.toString(),
                date: result.date.toISOString(),
                status: result.status,
                totalAmount: result.totalAmount,
                items: result.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            }, {
                _id: order._id.toString(),
                date: order.date.toISOString(),
                status: order.status,
                totalAmount: order.totalAmount,
                items: order.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            });

            assert(findByIdStub.calledOnce);
        });
    });

    describe('Update Order', function () {
        it('should update an order successfully', async function () {
            const orderId = new mongoose.Types.ObjectId();
            const updateData = {
                status: 'completed',
                totalAmount: 120,
                items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 3 }]
            };
            const updatedOrder = { _id: orderId, ...updateData };
            
            // Stub sur la méthode findByIdAndUpdate
            const findByIdAndUpdateStub = sandbox.stub(OrderModel, 'findByIdAndUpdate').resolves(updatedOrder);

            const result = await orderService.update({ orderId, fields: updateData });

            // Comparaison des champs pertinents
            assert.deepEqual({
                _id: result._id.toString(),
                status: result.status,
                totalAmount: result.totalAmount,
                items: result.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            }, {
                _id: updatedOrder._id.toString(),
                status: updatedOrder.status,
                totalAmount: updatedOrder.totalAmount,
                items: updatedOrder.items.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity: item.quantity
                }))
            });

            assert(findByIdAndUpdateStub.calledOnce);
        });

        it('should throw NotFound error when updating a non-existent order', async function () {
            const orderId = new mongoose.Types.ObjectId();
            
            // Stub sur la méthode findByIdAndUpdate pour retourner null
            const findByIdAndUpdateStub = sandbox.stub(OrderModel, 'findByIdAndUpdate').resolves(null);

            await assert.rejects(
                orderService.update({ orderId, fields: { status: 'completed' } }),
                new NotFound('Commande introuvable.')
            );
            assert(findByIdAndUpdateStub.calledOnce);
        });
    });

    describe('Delete Order', function () {
        it('should delete an order successfully', async function () {
            const orderId = new mongoose.Types.ObjectId();
            const order = {
                _id: orderId,
                date: new Date(),
                status: 'pending',
                totalAmount: 100,
                items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
            };
            
            // Stub sur la méthode findByIdAndDelete
            const findByIdAndDeleteStub = sandbox.stub(OrderModel, 'findByIdAndDelete').resolves(order);

            await assert.doesNotReject(
                orderService.remove({ orderId })
            );
            assert(findByIdAndDeleteStub.calledOnce);
        });

        it('should throw NotFound error when deleting a non-existent order', async function () {
            const orderId = new mongoose.Types.ObjectId();
            
            // Stub sur la méthode findByIdAndDelete pour retourner null
            const findByIdAndDeleteStub = sandbox.stub(OrderModel, 'findByIdAndDelete').resolves(null);

            await assert.rejects(
                orderService.remove({ orderId }),
                new NotFound('Commande introuvable.')
            );
            assert(findByIdAndDeleteStub.calledOnce);
        });
    });
});
