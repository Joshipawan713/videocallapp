const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static("public"));

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/public/index.html');
});

let connectedPeers = [];

io.on('connection', (socket)=>{
    // console.log("user connected to socket.io server");
    // console.log(socket.id);
    connectedPeers.push(socket.id);
    // console.log(connectedPeers);

    socket.on('pre-offer', (data)=> {
        console.log("pre-offer-came");
        // console.log(data);
        
        const {calleePersonalCode, callType} = data;
        console.log(calleePersonalCode);
        console.log(connectedPeers);
        // important part for two user connections
        const connectedPeer = connectedPeers.find( 
            (peerSocketId) => peerSocketId === calleePersonalCode
        );

        console.log(connectedPeer);

        if(connectedPeer){
            const data = {
                callerSocketId: socket.id,
                callType,
            };
            io.to(calleePersonalCode).emit('pre-offer', data);
        }
        else{
            const data = {
                preOfferAnswer: 'CALLEE_NOT_FOUND',
            };
            io.to(socket.id).emit('pre-offer-answer', data);
        }

    });

    socket.on('pre-offer-answer', (data)=> {
        // console.log('pre-offer answer came');
        // console.log(data);

        const { callerSocketId } = data;
        const connectedPeer = connectedPeers.find( 
            (peerSocketId) => peerSocketId === callerSocketId
        );

        if(connectedPeer){
            io.to(data.callerSocketId).emit('pre-offer-answer', data);
        }
    })

    socket.on('disconnect', ()=>{
        console.log("user disconnected");

        const newConnectedPeers = connectedPeers.filter((peerSocketId)=>{
            peerSocketId !== socket.id;
        });

        connectedPeers = newConnectedPeers;
        console.log(connectedPeers);

    });
});

server.listen(PORT, ()=>{
    console.log(`listening on ${PORT}`);
});