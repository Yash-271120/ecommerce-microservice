const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    products: [
        {
           product_id: {
                type: String
            },
        }
    ],
    user: {
        type: String,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('order', OrderSchema);