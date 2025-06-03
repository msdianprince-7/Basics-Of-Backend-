import mongoose from "mongoose";
const Schema  = mongoose.Schema;

const User = new Schema({
    name:String,
    password:String,
    email:{type:String,unique:true}
})

const Todo = new Schema({
    title:String,
    done:Boolean,
    userId:{type:Schema.Types.ObjectId,ref:'User'}
})

const UserModel = mongoose.model("users",User);
const TodoModel = mongoose.model("todo",Todo);

export {
    UserModel,TodoModel
}