import mongoose from 'mongoose'

const schema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        stock_quantity: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
)

const Product = mongoose.model('Product', schema);

export default Product;