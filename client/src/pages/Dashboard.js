import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const userRooms = await roomService.getUserRooms();
      setRooms(userRooms);
    } catch (err) {
      setError('Failed to load rooms');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await roomService.createRoom(roomName);
      navigate(`/room/${response.room.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await roomService.getRoomInfo(joinRoomId);
      navigate(`/room/${joinRoomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Rooms</h2>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => setShowCreateModal(true)}
          >
            Create Room
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowJoinModal(true)}
          >
            Join Room
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {rooms.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="text-muted">
              <h4>No rooms yet</h4>
              <p>Create a room or join an existing one to start collaborating!</p>
            </div>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="col-md-4 mb-3">
              <div 
                className="card room-card h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/room/${room.roomId}`)}
              >
                <div className="card-body">
                  <h5 className="card-title">{room.name}</h5>
                  <p className="card-text text-muted">
                    Room ID: <code>{room.roomId}</code>
                  </p>
                  <small className="text-muted">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Room</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRoom}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="roomName" className="form-label">Room Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <span className="loading-spinner me-2"></span> : null}
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Join Room</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowJoinModal(false)}
                ></button>
              </div>
              <form onSubmit={handleJoinRoom}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="joinRoomId" className="form-label">Room ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="joinRoomId"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <span className="loading-spinner me-2"></span> : null}
                    Join Room
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

export default Dashboard;