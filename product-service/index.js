const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const Product = require('./Product');
const isAuthenticated = require('../isAuthenticated');
var order;

var channel, connection;

mongoose.connect('mongodb://localhost:27017/product-service',{useNewUrlParser: true, useUnifiedTopology: true},()=>{
    console.log('Product-Service DB Connected');
});
app.use(express.json());


(async () => {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('PRODUCT');
})();

// create a new product
// buy a product

app.post('/product/create',isAuthenticated ,async (req, res) => {
    const {name, description, price} = req.body;
    const newProduct = new Product({
        name,
        description,
        price
    });
    await newProduct.save();
    return res.json(newProduct);
});


app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { Ids } = req.body;
    const products = await Product.find({ _id: { $in: Ids } });
    channel.sendToQueue('ORDER', Buffer.from(JSON.stringify({
      products,
      userEmail: req.user.email
    })));
    channel.consume('PRODUCT', (data) => {
      console.log("Cosuming product queue");
      order = JSON.parse(data.content);
      channel.ack(data);
    });
    console.log("yash",order);
    return res.json(order);
});


app.listen(PORT, () => {
  console.log(`Product service listening at http://localhost:${PORT}`);
});