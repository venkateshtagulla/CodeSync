import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import roomService from '../services/roomService';
import Chat from '../components/Chat';
import UserList from '../components/UserList';

function Room() {
  const { roomId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');

  useEffect(() => {
    loadRoomInfo();
  }, [roomId]);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('JOIN_ROOM', roomId);

      socket.on('CODE_UPDATE', handleCodeUpdate);
      socket.on('USER_LIST', setUsers);
      socket.on('NEW_MESSAGE', handleNewMessage);
      socket.on('CHAT_HISTORY', setMessages);

      return () => {
        socket.emit('LEAVE_ROOM', roomId);
        socket.off('CODE_UPDATE');
        socket.off('USER_LIST');
        socket.off('NEW_MESSAGE');
        socket.off('CHAT_HISTORY');
      };
    }
  }, [socket, roomId]);

  const loadRoomInfo = async () => {
    try {
      const roomData = await roomService.getRoomInfo(roomId);
      setRoom(roomData);
      setFiles(roomData.files);
      if (roomData.files.length > 0) {
        setActiveFile(roomData.files[0]);
      }
    } catch (err) {
      setError('Failed to load room information');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  const handleCodeUpdate = useCallback((data) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.fileName === data.fileName 
          ? { ...file, content: data.content, language: data.language || file.language }
          : file
      )
    );

    if (activeFile?.fileName === data.fileName) {
      setActiveFile(prev => ({ 
        ...prev, 
        content: data.content, 
        language: data.language || prev.language 
      }));
    }
  }, [activeFile]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleCodeChange = (value) => {
    if (!activeFile || !socket) return;

    const updatedFile = { ...activeFile, content: value };
    setActiveFile(updatedFile);
    
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.fileName === activeFile.fileName ? updatedFile : file
      )
    );

    socket.emit('CODE_CHANGE', {
      roomId,
      fileName: activeFile.fileName,
      content: value,
      language: activeFile.language
    });
  };

  const handleFileSelect = (file) => {
    setActiveFile(file);
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await roomService.createFile(roomId, newFileName, newFileLanguage);
      setFiles(response.files);
      setShowNewFileModal(false);
      setNewFileName('');
      setNewFileLanguage('javascript');
      
      // Select the new file
      const newFile = response.files.find(f => f.fileName === newFileName);
      if (newFile) {
        setActiveFile(newFile);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (files.length <= 1) {
      setError('Cannot delete the last file');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        const response = await roomService.deleteFile(roomId, fileName);
        setFiles(response.files);
        
        if (activeFile?.fileName === fileName) {
          setActiveFile(response.files[0] || null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete file');
      }
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;

    setLoading(true);
    setOutput('Running...');

    try {
      const result = await roomService.runCode(roomId, activeFile.content, activeFile.language);
      setOutput(result.output || result.error || 'No output');
    } catch (err) {
      setOutput('Failed to run code');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await roomService.saveRoom(roomId, files);
      setError('');
      // Show success message briefly
      const originalError = error;
      setError('Saved successfully!');
      setTimeout(() => setError(originalError), 2000);
    } catch (err) {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (message) => {
    if (socket) {
      socket.emit('MESSAGE', { roomId, text: message });
    }
  };

  if (!room) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-2">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2">
      <div className="row">
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>{room.name}</h4>
              <small className="text-muted">Room ID: {roomId}</small>
            </div>
            <div>
              <button 
                className="btn btn-success me-2"
                onClick={handleRunCode}
                disabled={loading || !activeFile}
              >
                {loading ? <span className="loading-spinner me-2"></span> : null}
                Run Code
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>

          {error && (
            <div className={`alert ${error.includes('success') ? 'alert-success' : 'alert-danger'}`} role="alert">
              {error}
            </div>
          )}

          {/* File Tabs */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div className="file-tabs d-flex">
                {files.map((file) => (
                  <div key={file.fileName} className="d-flex align-items-center">
                    <button
                      className={`file-tab ${activeFile?.fileName === file.fileName ? 'active' : ''}`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {file.fileName}
                    </button>
                    {files.length > 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger ms-1"
                        onClick={() => handleDeleteFile(file.fileName)}
                        title="Delete file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => setShowNewFileModal(true)}
              >
                + New File
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="editor-container border">
            {activeFile ? (
              <Editor
                height="500px"
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true
                }}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                <p className="text-muted">No file selected</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          {output && (
            <div className="mt-3">
              <h6>Output:</h6>
              <div className="output-panel">
                {output}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Online Users ({users.length})</h6>
            </div>
            <div className="card-body">
              <UserList users={users} />
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Chat</h6>
            </div>
            <div className="card-body p-0">
              <Chat 
                messages={messages}
                onSendMessage={sendMessage}
                currentUser={user}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New File</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowNewFileModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateFile}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="fileName" className="form-label">File Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fileName"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="fileLanguage" className="form-label">Language</label>
                    <select
                      className="form-select"
                      id="fileLanguage"
                      value={newFileLanguage}
                      onChange={(e) => setNewFileLanguage(e.target.value)}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowNewFileModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Create File
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Room;