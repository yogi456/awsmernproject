const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const { exec } = require("child_process")

var UserDetail = undefined;
var UserInstances = undefined;
var Public_ip = undefined;
var Current_inst_id = undefined;

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

app.post("/dashbord", (req,res)=>{

    var UserEmail = req.body.mail;
    var Userpass = req.body.pass;
    db.collection('users').findOne({ "Email": UserEmail, "PassWord": Userpass }, (err, collection) =>{
        if (err) {
            throw err;
        }
        if (collection === null)
        {
            console.log("Unregistered User tries to login ! ! ! !")
            res.sendFile(__dirname+"/Login.html")
        }
        else{
            console.log("User identified and logeed in successfully . . . . .")
            res.sendFile(__dirname+"/UserPortal.html")
            UserDetail = collection;
            db.collection('instancess').find({"Email" : UserDetail.Email}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                UserInstances = result;
              });
        }
    }
    )
}
 )

app.get("/instances",(req,res)=>{
    res.sendFile(__dirname+"/UserInstance.html")
}
)
app.post("/Instanceinfo",(req,res)=>{
    res.send(UserInstances)
})

app.post("/CurrentIp",(req,res)=>{
    res.send(Public_ip)
})

app.post("/ConsoleUpdate",(req,res)=>{
    var clientCommand = req.body.name;
    exec( "ssh -i MyKeyPair.pem ec2-user@"+Public_ip+" "+clientCommand , (err,stdout,stderr)=>{
        console.log("ssh -i MyKeyPair.pem ec2-user@"+Public_ip+" "+clientCommand);
        if(err) throw err;
        res.send(stdout+stderr)

    })
    
})

app.post("/dashbordinfo",(req,res)=>{
    res.send(UserDetail)
})

app.get("/createinstance",(req,res)=>{
    res.sendFile(__dirname+"/InstanceDetails.html")
}
)

app.post("/launchinstance",(req,res)=>{
    var instdetail = req.body;
    exec( "aws ec2 run-instances --image-id "+ instdetail.os +" --count 1 --instance-type " + instdetail.instance_type + " --key-name MyKeyPair --security-group-ids "+ instdetail.access +" --subnet-id "+instdetail.subid , (err,stdout,stderr)=>{
        
        var Instanceid = JSON.parse(stdout).Instances[0].InstanceId
        if(stdout){
        console.log("InstanceId : "+Instanceid )
        console.log ( "User Required Instance launched ")
        }
        if(stderr)
        {
            console.log(stderr)
        }
        exec( "aws ec2 create-tags --resources "+Instanceid+" --tags Key=Name,Value="+instdetail.instname.split(' ').join('-') , (err,stdout,stderr)=>{
            if(err){
                throw err;
            }
            if(stdout){
             console.log(stdout)
            }
            if(stderr)
            {
                console.log(stderr)
            } 
            console.log("With Name "+instdetail.instname.split(' ').join('-'))
            var instancedata =  {
                "Email" : UserDetail.Email,
                "InstName" : instdetail.instname.split(' ').join('-'),
                "OS" : instdetail.os,
                "InstID" : Instanceid,
                "type" : instdetail.instance_type,
                "sgid" : instdetail.access,
                "subnetid" : instdetail.subid
            }
            db.collection('instancess').insertOne(instancedata,(err,collection)=>{
                if(err){
                    throw err;
                }
                db.collection('instancess').find({Email : UserDetail.Email}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                UserInstances = result;
              });

                console.log("User Instance Details Saved Succ . . . . ");
                res.sendFile(__dirname+"/UserPortal.html")
            }); 
            
        })
    
    })


})
    
app.post("/runistance",(req,res)=>{

    Current_inst_id = req.body.instanceid;
    exec(" aws ec2 describe-instances --instance-ids "+Current_inst_id+" --query Reservations[].Instances[].PublicIpAddress",(err,stdout,stderr)=>{
        if(err) throw err;
        if(stdout){
        Public_ip = JSON.parse(stdout)[0];
            console.log(stderr);
        }
        if(stderr) console.log("Error in ececuting ....."+stderr)
    res.sendFile(__dirname+"/UserInstance.html")
    })
});



app.listen( 4000 ,()=>{
    console.log("server started !!! on port number 4000");
})