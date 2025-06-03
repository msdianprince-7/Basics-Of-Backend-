import {z} from "zod"
import bcrypt from "bcrypt"
import express from "express"
const app= express();
import mongoose from "mongoose";
import { UserModel,TodoModel } from "./db.js";
import jwt from "jsonwebtoken"
const JWT_SECRET = "sdfbdsjfkbsjfbaskjbf";

mongoose.connect("")

app.use(express.json())

app.post("/signup",async function(req,res){

    const requiredBody = z.object({
        email:z.string().min(3).max(100).email(),
        password:z.string().min(3).max(30),
        name:z.string().min(3).max(100)
    })
    
    // const parsedBody = requiredBody.parse(req.body); this will either throw an error or it will return data 

    const parsedBody = requiredBody.safeParse(req.body);// prefer to use this 

    // returns {
    //     success:true |false
    //     data:{}
    //     errors:[]
    // }
    if(!parsedBody.success){
        res.json({
            message:"Incorrect format",
            error:parsedBody.error
        })
        return;
    }

    const name =  req.body.name;
    const password = req.body.password;
    const email = req.body.email ; 

    try {
            const hashedPassword = await bcrypt.hash(password,10);
            await UserModel.create({
                name,
                password:hashedPassword,
                email,
            })
    } catch (error) {
        res.json({
            message:"User already exists"
        })
    }

    res.json({
        message:"User has signed up"
    })
})

app.post("/signin",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email
    });

    if(!response){
        res.status(403).json({
            message:"user does not exist"
        })
    }

    const passwordMatch = await bcrypt.compare(password,response.password);

    if(passwordMatch){
        const token = jwt.sign({
            id:response._id.toString()
        },JWT_SECRET)

        res.json({
            token
        })
    }else{
        res.status(403).json({
                message:"You have signed up"
        })
    }

})

function auth(req,res,next){
    const token = req.headers.authorization;

    const response = jwt.verify(token,JWT_SECRET);
    
    if(response){
        req.userId = response.id;
        next();
    }else{
        res.status(403).json({
            message:"Invalid Credentiala"
        })
    }
}

app.post("/todo",auth,async function(req,res){
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;
    await TodoModel.create({
        title,
        userId,
        done
    })
    res.json({
        userId
    })
});

app.get("/todos",auth,async function(req,res){
    const userId = req.userId;
    const todos = await TodoModel.find({
        userId
    })
    res.json({
        todos
    })
});




app.listen(3000);
