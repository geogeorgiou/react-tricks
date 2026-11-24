import { Activity, useEffect, useState } from 'react';

const ChatRoom = () => {
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    console.log('connected');
    return () => console.log('disconnected');
  }, []);

  return (
    <div>
      <p>Messages sent: {sentCount}</p>
      <button onClick={() => setSentCount((c) => c + 1)}>Send</button>
    </div>
  );
};

export const App2 = () => {
  const [showChat, setShowChat] = useState(true);

  return (
    <div>
      <button onClick={() => setShowChat((s) => !s)}>
        {showChat ? 'Hide' : 'Show'} chat
      </button>
      <Activity mode={showChat ? 'visible' : 'hidden'}>
        <ChatRoom />
      </Activity>
    </div>
  );
};
