const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");

app.use(express.static(path.join(__dirname,"Frontend")));

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 


mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});



var db = mongoose.connection;


db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))



// Route for Homepage 
app.get("/Home", function (req,res) {   
    console.log("client ask for home page");
    res.sendFile(__dirname+"/HomePage.html");
});

// Route for Forget password page 
app.get("/PassRecovery", function (req,res) {   
    console.log("client ask for Forget password page");
    res.sendFile(__dirname+"/Forgetpass.html");
});

// Route for serving Sign In
app.get("/SignIn", function (req,res) {   
    console.log("client ask for Login page");
    res.sendFile(__dirname+"/Login.html");
});

// Route for serving Sign Up
app.get("/SignUp", function (req,res) {   
    console.log("client ask for SignUp page");
    res.sendFile(__dirname+"/SignUp.html");
});

//Retriving data from user for sign_up
app.post("/createuser", function (req,res) {   
    
    var unique = true;
    var FirstName = req.body.fname;
    var LastName = req.body.lname;
    var Email = req.body.mail;
    var UserName = req.body.user;
    var PassWord = req.body.pass;

    var data = {
        "FirstName" : req.body.fname,
        "LastName" : req.body.lname,
        "Email" : req.body.mail,
        "UserName" : req.body.user,
        "PassWord" : req.body.pass
    }
        if ( unique === true )
        {
            //console.log(unique)
            db.collection('users').insertOne(data,(err,collection)=>{
                if(err){
                    throw err;
                }
          //      console.log("Record Inserted Successfully");
                res.sendFile(__dirname+"/UserCreationSucc.html");
                console.log("d")
            });
            console.log("c")
        }

    db.collection('users').findOne({"UserName": UserName},(err,collection)=>{
        if(err){
            throw err;
        }
        unique = false;
        //console.log("duplicate user !")
        res.sendFile(__dirname+"/UserDuplicate.html");
        console.log("b")
    });

    console.log("a")
    
    //    console.log(unique)
    //console.log(FirstName , LastName , Email , UserName , PassWord )
});

app.listen( 4000 ,()=>{
    console.log("server started !!! on port 4000");
})