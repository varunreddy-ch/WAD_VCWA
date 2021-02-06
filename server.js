const express = require("express");
const app = express();

app.use(express.static('public'))

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))

//mongoose connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true, useUnifiedTopology: true});

//user schema
const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    password : String 
});
const User = mongoose.model("User" , userSchema);

//Inserting data to db
/*const user = new User ({
    firstName : "varun",
    lastName : "reddy",
    email : "varunreddy@gmail.com",
    password : "12345678"
})
user.save();*/
/*
User.find({firstName : "varun"} , function(err , data){
    if(err){
        console.log(err);
    }
    else{
        console.log(data);
    }
});*/

//Server listening on port:3000
app.listen(3000 , function(){
    console.log("Server Started");
})
//Homepage Request
app.get("/" , function(req , res){
    res.sendFile(__dirname + "/homepage.html");
})
//Sign in page request
app.get("/Sign-in" , function(req , res){
    res.sendFile(__dirname + "/sign-in.html");
})
//Sign up page request
app.get("/Sign-up" , function(req , res){
    res.sendFile(__dirname + "/sign-up.html");
})

//Sign in verification
app.post("/Sign-in" , function(req,res){
    console.log(req.body)
    User.find({email : req.body.email} , 'firstName password' , function(err , data){
        if(err){
            console.log(err);
        }
        else{
            console.log(data.length)
            if(!(data.length)){ 
                res.send("no user found");
            }
            else{
                if(req.body.password == data[0].password){
                    res.send("Welcome " + data[0].firstName);
                }
                else{
                    res.send("Password incorrect");
                }
            }
        }
    })
})

//Sign up 
app.post("/Sign-up" , function(req,res){
    console.log(req.body)
    User.find({email : req.body.email} , 'password' , function(err , data){
        if(err){
            console.log(err);
        }
        else{
            if((data.length)){
                res.send("email already exists");
            }
            else{
                const user = new User ({
                    firstName : req.body.fname,
                    lastName : req.body.lname,
                    email : req.body.email,
                    password : req.body.password,
                })
                user.save();
                res.send("Account created successfully")
            }
        }
    })
})




