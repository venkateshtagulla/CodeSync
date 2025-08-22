import React from 'react';

function UserList({ users }) {
  if (users.length === 0) {
    return (
      <div className="text-center text-muted">
        <p>No users online</p>
      </div>
    );
  }

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} className="d-flex align-items-center mb-2">
          <span className="online-indicator"></span>
          <span className="ms-2">{user.username}</span>
        </div>
      ))}
    </div>
  );
}

export default UserList;