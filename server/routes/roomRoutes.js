import express from 'express';
import Room from '../models/Room.js';
import Chat from '../models/Chat.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { generateRoomId } from '../utils/roomUtils.js';
import { executeCode } from '../services/jdoodleService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create room
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const roomId = generateRoomId();

    const room = new Room({
      roomId,
      name,
      createdBy: req.user._id,
      members: [req.user._id],
      files: [{
        fileName: 'main.js',
        content: '// Welcome to the collaborative editor!\nconsole.log("Hello, World!");',
        language: 'javascript'
      }]
    });

    await room.save();

    // Create chat for the room
    const chat = new Chat({ roomId, messages: [] });
    await chat.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        roomId: room.roomId,
        name: room.name,
        files: room.files
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId }).populate('members', 'username');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add user to room if not already a member
    if (!room.members.some(member => member._id.toString() === req.user._id.toString())) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json({
      roomId: room.roomId,
      name: room.name,
      files: room.files,
      members: room.members
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's rooms
router.get('/user/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id
    }).select('roomId name createdAt').sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create file
router.post('/:roomId/files', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { fileName, language = 'javascript' } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if file already exists
    if (room.files.some(file => file.fileName === fileName)) {
      return res.status(400).json({ message: 'File already exists' });
    }

    room.files.push({
      fileName,
      content: '',
      language
    });

    await room.save();

    res.json({ message: 'File created successfully', files: room.files });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete file
router.delete('/:roomId/files/:fileName', async (req, res) => {
  try {
    const { roomId, fileName } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.files = room.files.filter(file => file.fileName !== fileName);
    await room.save();

    res.json({ message: 'File deleted successfully', files: room.files });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Run code
router.post('/:roomId/run', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    const result = await executeCode(code, language);
    res.json(result);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: 'Code execution failed' });
  }
});

// Save room
router.post('/:roomId/save', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { files } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.files = files;
    await room.save();

    res.json({ message: 'Room saved successfully' });
  } catch (error) {
    console.error('Save room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;