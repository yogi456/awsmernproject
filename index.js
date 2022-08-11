const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const {exe, exec} = require("child_process")

app.use(express.static(path.join(__dirname,"Frontend")));

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

//database connectivity
mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection
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

//Retriving data from user to sign_up
app.post("/createuser", (req,res) => {   
    var UserEmail = req.body.mail;
    var data = {
        "FirstName" : req.body.fname,
        "LastName" : req.body.lname,
        "Email" : req.body.mail,
        "PassWord" : req.body.pass
    }
    db.collection('users').findOne({ "Email": UserEmail }, (err, collection) => {
            if (err) {
                throw err;
            }
            if (collection == null) {
                db.collection('users').insertOne(data,(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    console.log("User registered Successfully. . . . ");
                    res.sendFile(__dirname+"/UserCreationSucc.html");
                }); 
            }
            else{ 
                console.log("Existing User wants to register again ! ! ! !")
            res.sendFile(__dirname+"/UserDuplicate.html");
             }
    });
});

app.post("/authsignin", (req,res)=>{
    var UserEmail = req.body.mail;
    var Userpass = req.body.pass;
    db.collection('users').findOne({ "Email": UserEmail, "PassWord": Userpass }, (err, collection) =>{
        if (err) {
            throw err;
        }
        if (collection === null)
        {
            console.log("Unregistered User tries to login ! ! ! !")
        }
        else{
            console.log("User identified and logeed in successfully . . . . .")
            res.sendFile(__dirname+"/UserPortal.html")
        }
    }
    )
}
 )

app.get("/instances",(req,res)=>{
    res.sendFile(__dirname+"/UserInstance.html")
}
)

app.post("/ConsoleUpdate",(req,res)=>{
    var clientCommand = req.body.name;
    exec( "ssh -i mymachine.pem wdiubqwlbqwd@49840"+   clientCommand , (err,stdout,stderr)=>{
        res.send(stdout+stderr)

    })
    
})





app.listen( 4000 ,()=>{
    console.log("server started !!! on port number 4000");
})
