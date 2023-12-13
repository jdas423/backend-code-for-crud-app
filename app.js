const express= require('express');
const app= express();
const mongoose= require('mongoose');
const {User}= require('./usersmodel');
const {wrapAsync,appError}= require('./errorhandling');
const search= require('./search');
// const teams=require('./teams');
const users=require('./users')
const cors= require("cors");
const dotenv= require('dotenv');
const methodOverride= require('method-override');

dotenv.config();
let lastIndex,sw=1;

const PORT= process.env.PORT || 3000;
mongoose.connect(process.env.CONNECTION_STRING).then(() => 
{
    sw=0;
    User.find({}).then(users => {
        lastIndex= users.length;
    })
    .catch(err => {
        console.error('Could not get users...',err)
        sw=1;
    })
    console.log('Connected to MongoDB...')
})
.catch(err => 
    {
        console.error('Could not connect to MongoDB...',err)
    });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(wrapAsync(async (req, res, next) =>{
    if(sw==1) throw new appError(500,"Database Error");
    next();
}))

app.use('/api/users/search',search);
// app.use('/api/users/teams',teams);
app.use('/api/users',users);

app.get("/api/limit",wrapAsync(async(req,res)=>{
    const limit= await User.countDocuments({});
    const limitObj= JSON.stringify({limit : Math.ceil(limit/10)});
    res.json(limitObj);
}))



app.use("*",wrapAsync((req,res,next)=>{
    throw new appError(404,"Page Not Found");
}))

app.use((err,req,res,next)=>{
    const {status=500,message="Something went wrong"}= err;
    res.status(status).send(message);
})

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:3000`)
})



