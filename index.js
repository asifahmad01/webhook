const express = require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();

const app=express().use(body_parser.json());

// sending request
const token=process.env.TOKEN;

// verify webhook
const mytoken=process.env.MYTOKEN;


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`starting server at ${port}`);
});

// to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res)=>{
    let mode=req.query["hub.mode"];
    let challenge=req.query["hub.challenge"];
    let token=req.query["hub.verify_token"];

    if(mode && token){
        if(mode==="subscribe" && token===mytoken){
            res.status(200).send(challenge);
        }else{
            res.status(403);
        }
    }
});

app.post("/webhook",(req, res)=>{
    let body_param= req.body;

    console.log(JSON.stringify(body_param,null,2));

    // extract the value fromated request
    if(body_param.object){
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.message && 
            body_param.entry[0].changes[0].value.message[0]
            ){
                let phone_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;


                // token which i used to send message to the user
                axios({
                    method:"POST",
                    url:"https://graph.facebook.com/v17.0/"+phone_no_id+"/messages?access_token="+token,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:"Hi.. I'm asif"
                        }
                    },
                    headers:{
                        "Content-Type":"application/json"
                    }
                }).then(response => {
                    console.log(response);
                    res.sendStatus(200);
                }).catch(error => {
                    console.error(error);
                    res.sendStatus(500);
                });
            }else{
                res.sendStatus(404);
            }
    }
});

app.get("/",(req, res)=>{
    res.status(200).send("hello there");
});