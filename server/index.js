import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import http from 'http';
import dotenv from "dotenv";
import { login, signup } from "./controllers/auth.controller.js";
import { createPost } from "./controllers/post.controller.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/user.model.js";
import Post from "./models/post.model.js";
import { Server } from 'socket.io';
//import { users, posts } from "./data/index.js";
import path from "path";
import connectMongoDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import cookieParser from "cookie-parser"
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express()
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
app.use(express.json({ limit: "5mb" })); // to parse req.body hadik hiya
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

const httpServer = http.createServer(app);
//const io = new Server(httpServer);
//const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

// Configure CORS middleware with allowed origins
app.use(cors({
  origin: '*',
}));

const io = new Server(httpServer, {
  cors: {
    origin: '*', // replace with your client's origin
    methods: ['GET', 'POST']
  }
});
app.use( express.json() )

app.get( '/' , ( req ,res ) => {
  res.send( 'hello ')
})

/* ROUTES WITH FILES */
app.post("/auth/signup", signup);




/* ROUTES */


import createRouter from "./routes/conversation.router.js";
import createGroupRouter from "./routes/group.router.js";
const conversationRoutes = createRouter(io);
app.use("/conversations", conversationRoutes);
const groupRoutes = createGroupRouter(io);
app.use("/groups",groupRoutes);

//connection route 
app.post('/api/connect', verifyToken, (req, res) => {
  console.log('Received connection request from client');
  
  // Print the JWT token
  console.log('JWT:', req.cookies.jwt);

  // Print the user object added by the verifyToken middleware
  console.log('User:', req.user._id);

  // You can also access the data sent in the request body
  console.log('Socket ID:', req.body.socketId);

  res.status(200).json({ message: 'Connection successful' });
});



mongoose.connect(process.env.CONNECTION_STRING ,
{
  useNewUrlParser : true,
  useUnifiedTopology : true

}
)

const db = mongoose.connection;

db.on("error" , console.error.bind(console , "connection error 123 : "));
db.once("open" , function(){
  
  console.log("database connected successfully ..");
}  )

//app.listen(process.env.PORT ,  ()=> {
  //console.log (` app listening on port ${process.env.PORT}`);//
//})
httpServer.listen(process.env.PORT ,  ()=> {
  console.log (` app listening on port ${process.env.PORT}`);
})

const userSocketIds = {};
//client to server connection
io.on('connection', (socket) => {
      //const connectedUserId = socket.handshake.query.userId;
      //console.log('clientconnectedtoserver with socketid',socket.id);
      //console.log("hashcontent",userSocketIds);
      //userSocketIds[connectedUserId] = socket.id;
      //console.log("hashcontent from",connectedUserId,"==",userSocketIds);
      //console.log(`User ${connectedUserId} connected with socket ID ${socket.id}`);
      //socket.emit("update",userSocketIds);
      
    

    socket.on('NewMessage', (message) => {
      //console.log("xxyy");
    console.log('Received new message:', message);
    const { SenderId, ReceiverId } = message;
    if (userSocketIds.hasOwnProperty(ReceiverId)) {
            const receiverSocketId = userSocketIds[ReceiverId];
            io.to(receiverSocketId).emit('NewMessage', message);
        } else {
            // Receiver is offline
            console.log(`Receiver ${ReceiverId} is offline`);
        }
        
    if (userSocketIds.hasOwnProperty(SenderId)){
          const senderSocketId = userSocketIds[SenderId];
          io.to(senderSocketId).emit("NewMessage",message);
    }

        
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (let userId in userSocketIds) {
            if (userSocketIds[userId] === socket.id) {
                delete userSocketIds[userId];
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

