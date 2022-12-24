const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require('mongoose');
const User = require('./User');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://localhost:27017/auth-service',{useNewUrlParser: true, useUnifiedTopology: true},()=>{
    console.log('Auth-Service DB Connected');
});
app.use(express.json());

// Register
//Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
        return res.json({ message: "User doesn't exists" });
    }else{
        if(user.password !== password){
            return res.json({ message: "Password is incorrect" });
        }

        const payload = {
            email,
            name: user.name
        }
        jwt.sign(payload, "secret",(err, token) => {
            if(err)console.log(err);
            else{
                return res.json({token: token });
            }
        });
    }
});


app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if(userExists){
        return res.json({ message: 'User already exists' });
    }else{
        const newUser = new User({
            name,
            email,
            password
        });
        await newUser.save();
       return res.json(newUser);
    }
});



app.listen(PORT, () => {
  console.log(`Auth service listening at http://localhost:${PORT}`);
});