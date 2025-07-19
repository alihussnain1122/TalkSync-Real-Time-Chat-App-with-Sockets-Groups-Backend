export const socketHandler = (io) => {
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on("setup", (userData) => {
            socket.join(userData._id);
            socket.userId = userData._id; // Store user ID for typing events
            onlineUsers.set(userData._id, socket.id);
            
            // Notify others that user is online
            socket.broadcast.emit("user online", userData._id);
            socket.emit("connected");
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log('User joined room:', room);
        });

        socket.on("typing", (data) => {
            // Handle both old format (string) and new format (object)
            const room = typeof data === 'string' ? data : data.chatId;
            const userName = typeof data === 'object' ? data.userName : 'Someone';
            
            socket.in(room).emit("typing", {
                userId: socket.userId,
                userName: userName
            });
        })
        
        socket.on("stop typing", (data) => {
            // Handle both old format (string) and new format (object)
            const room = typeof data === 'string' ? data : data.chatId;
            
            socket.in(room).emit("stop typing", {
                userId: socket.userId
            });
        });

        socket.on("new message", (message) => {
            const chat = message.chat;
            if (!chat.users) return;

            chat.users.forEach((user) => {
                if (user._id !== message.sender._id) {
                    socket.in(user._id).emit("message received", message);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected");
            
            // Find and remove user from online users
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    // Notify others that user is offline
                    socket.broadcast.emit("user offline", userId);
                    break;
                }
            }
        });
    });
}