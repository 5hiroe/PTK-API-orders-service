import sinon from 'sinon';
import assert from 'assert';
import OrderService from '../../src/services/orders.js';
import OrderModel from '../../src/models/order.js';
import { NotFound } from '../../src/globals/errors.js';
import mongoose from 'mongoose';

describe('OrderService', function() {
  let orderService;
  let findStub;
  let findByIdStub;
  let findByIdAndUpdateStub;
  let saveStub;
  let findByIdAndDeleteStub;

  beforeEach(function() {
    orderService = new OrderService();
    findStub = sinon.stub(OrderModel, 'find');
    findByIdStub = sinon.stub(OrderModel, 'findById');
    findByIdAndUpdateStub = sinon.stub(OrderModel, 'findByIdAndUpdate');
    saveStub = sinon.stub(OrderModel.prototype, 'save');
    findByIdAndDeleteStub = sinon.stub(OrderModel, 'findByIdAndDelete');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('getAll', function() {
    it('should return all orders', async function() {
      const mockOrders = [
        {
          _id: new mongoose.Types.ObjectId(),
          date: new Date(),
          status: 'pending',
          totalAmount: 100,
          items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
        }
      ];
      findStub.resolves(mockOrders);

      const orders = await orderService.getAll();
      assert.strictEqual(orders.length, 1);
      assert.strictEqual(orders[0].status, 'pending');
    });

    it('should throw NotFound error if no orders found', async function() {
      findStub.resolves([]);

      try {
        await orderService.getAll();
        assert.fail('Expected error not thrown');
      } catch (err) {
        assert(err instanceof NotFound);
        assert.strictEqual(err.message, 'Aucune commande trouvée.');
      }
    });
  });

  describe('get', function() {
    it('should return an order by ID', async function() {
      const mockOrder = {
        _id: new mongoose.Types.ObjectId(),
        date: new Date(),
        status: 'pending',
        totalAmount: 100,
        items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
      };
      findByIdStub.resolves(mockOrder);

      const order = await orderService.get({ orderId: mockOrder._id });
      assert.strictEqual(order.status, 'pending');
    });

    it('should throw NotFound error if order not found by ID', async function() {
      findByIdStub.resolves(null);

      try {
        await orderService.get({ orderId: new mongoose.Types.ObjectId() });
        assert.fail('Expected error not thrown');
      } catch (err) {
        assert(err instanceof NotFound);
        assert.strictEqual(err.message, 'Commande introuvable.');
      }
    });
  });

  describe('create', function() {
    it('should create a new order', async function() {
      const orderData = {
        date: new Date(),
        status: 'pending',
        totalAmount: 100,
        items: [{ product_id: new mongoose.Types.ObjectId(), quantity: 2 }]
      };
      const mockOrder = new OrderModel(orderData);
      saveStub.resolves(mockOrder);

      const createdOrder = await orderService.create({ fields: orderData });
      assert.strictEqual(createdOrder.status, 'pending');
    });
  });

  describe('update', function() {
    it('should update an order by ID', async function() {
      const orderId = new mongoose.Types.ObjectId();
      const updateFields = { status: 'completed' };
      const mockOrder = { _id: orderId, status: 'completed' };
      findByIdAndUpdateStub.resolves(mockOrder);

      const updatedOrder = await orderService.update({ orderId, fields: updateFields });
      assert.strictEqual(updatedOrder.status, 'completed');
    });

    it('should throw NotFound error if order to update is not found', async function() {
      const orderId = new mongoose.Types.ObjectId();
      const updateFields = { status: 'completed' };
      findByIdAndUpdateStub.resolves(null);

      try {
        await orderService.update({ orderId, fields: updateFields });
        assert.fail('Expected error not thrown');
      } catch (err) {
        assert(err instanceof NotFound);
        assert.strictEqual(err.message, 'Commande introuvable.');
      }
    });
  });

  describe('remove', function() {
    it('should remove an order by ID', async function() {
      const orderId = new mongoose.Types.ObjectId();
      findByIdAndDeleteStub.resolves({ _id: orderId });

      await orderService.remove({ orderId });
      assert(findByIdAndDeleteStub.calledOnceWithExactly(orderId));
    });

    it('should throw NotFound error if order to remove is not found', async function() {
      const orderId = new mongoose.Types.ObjectId();
      findByIdAndDeleteStub.resolves(null);

      try {
        await orderService.remove({ orderId });
        assert.fail('Expected error not thrown');
      } catch (err) {
        assert(err instanceof NotFound);
        assert.strictEqual(err.message, 'Commande introuvable.');
      }
    });
  });
});
