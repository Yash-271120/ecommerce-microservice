const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 9090;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const Order = require('./Order');
const isAuthenticated = require('../isAuthenticated');

var channel, connection;

mongoose.connect('mongodb://localhost:27017/order-service',{useNewUrlParser: true, useUnifiedTopology: true},()=>{
    console.log('Order-Service DB Connected');
});
app.use(express.json());

const createOrder = async (products,userEmail)=>{
    let total_price = 0;
    for(let i=0;i<products.length;i++){
        total_price += products[i].price;
    }
    const order = new Order({
        products,
        user: userEmail,
        total_price
    });
    await order.save();
    return order;
}

(async () => {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('ORDER');
})().then(() => {
    channel.consume('ORDER', async(data) => {
        console.log("Cosuming order queue");
        const { products, userEmail } = JSON.parse(data.content.toString());
        const newOrder = await createOrder(products,userEmail);
        console.log("new order",newOrder);
        channel.ack(data);
        channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify({newOrder})));
    });
});



app.listen(PORT, () => {
  console.log(`Order service listening at http://localhost:${PORT}`);
});