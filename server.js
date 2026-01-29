    const express=require("express")
    const dotenv=require("dotenv")
    const authRoutes=require("./routes/authroutes")
    const userRoutes=require('./routes/userRoutes')
    const charRoutes=require('./routes/chatRoutes')
    const cookieparser=require('cookie-parser')
    const {connect}=require('./lib/db')
    const cors=require('cors')
    
    dotenv.config();
    const app=express()
    console.log("ENV PORT =", process.env.PORT);

    const PORT=process.env.PORT ||5001;

    app.use(express.json())
    app.use(cookieparser())
    
    app.use(cors({
        origin:"http://localhost:5173",
        credentials:true
    }))
    app.use("/api/auth",authRoutes)
    app.use("/api/users",userRoutes)
    app.use("/api/chat",charRoutes);

    app.get("/",(req,res)=>{
        res.send("hello world");
    })
    
    connect();
    app.listen(PORT,()=>{
        console.log(`server is running on ${PORT}`)
    })