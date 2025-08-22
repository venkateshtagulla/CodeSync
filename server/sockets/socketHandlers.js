import Room from '../models/Room.js';
import Chat from '../models/Chat.js';

const activeUsers = new Map(); // roomId -> Set of user objects

export default function socketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    socket.on('JOIN_ROOM', async (roomId) => {
      try {
        socket.join(roomId);
        
        // Add user to active users
        if (!activeUsers.has(roomId)) {
          activeUsers.set(roomId, new Set());
        }
        activeUsers.get(roomId).add({
          id: socket.user._id.toString(),
          username: socket.user.username,
          socketId: socket.id
        });

        // Get chat history
        const chat = await Chat.findOne({ roomId });
        if (chat) {
          socket.emit('CHAT_HISTORY', chat.messages);
        }

        // Broadcast updated user list
        const users = Array.from(activeUsers.get(roomId) || []);
        io.to(roomId).emit('USER_LIST', users);

        console.log(`User ${socket.user.username} joined room ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    socket.on('LEAVE_ROOM', (roomId) => {
      socket.leave(roomId);
      
      // Remove user from active users
      if (activeUsers.has(roomId)) {
        const users = activeUsers.get(roomId);
        for (const user of users) {
          if (user.socketId === socket.id) {
            users.delete(user);
            break;
          }
        }

        // Broadcast updated user list
        const userList = Array.from(users);
        io.to(roomId).emit('USER_LIST', userList);
      }

      console.log(`User ${socket.user.username} left room ${roomId}`);
    });

    socket.on('CODE_CHANGE', async (data) => {
      try {
        const { roomId, fileName, content, language } = data;
        
        // Update database
        const room = await Room.findOne({ roomId });
        if (room) {
          const fileIndex = room.files.findIndex(f => f.fileName === fileName);
          if (fileIndex !== -1) {
            room.files[fileIndex].content = content;
            if (language) {
              room.files[fileIndex].language = language;
            }
            await room.save();
          }
        }

        // Broadcast to other users in the room
        socket.to(roomId).emit('CODE_UPDATE', {
          fileName,
          content,
          language,
          updatedBy: socket.user.username
        });
      } catch (error) {
        console.error('Code change error:', error);
      }
    });

    socket.on('MESSAGE', async (data) => {
      try {
        const { roomId, text } = data;
        
        const messageData = {
          user: socket.user.username,
          userId: socket.user._id,
          text,
          timestamp: new Date()
        };

        // Save to database
        let chat = await Chat.findOne({ roomId });
        if (!chat) {
          chat = new Chat({ roomId, messages: [] });
        }
        chat.messages.push(messageData);
        await chat.save();

        // Broadcast to all users in the room
        io.to(roomId).emit('NEW_MESSAGE', messageData);
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('disconnect', () => {
      // Remove user from all rooms
      for (const [roomId, users] of activeUsers.entries()) {
        for (const user of users) {
          if (user.socketId === socket.id) {
            users.delete(user);
            
            // Broadcast updated user list
            const userList = Array.from(users);
            io.to(roomId).emit('USER_LIST', userList);
            break;
          }
        }
      }
      
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
}