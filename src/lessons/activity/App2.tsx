import { Activity, useEffect, useState } from 'react';

type Connection = 'connected' | 'disconnected';

const ChatRoom = ({
  onConnectionChange,
}: {
  onConnectionChange: (connection: Connection) => void;
}) => {
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    console.log('connected');
    onConnectionChange('connected');
    return () => {
      console.log('disconnected');
      onConnectionChange('disconnected');
    };
  }, []);

  return (
    <p>
      <span>Messages sent: {sentCount}</span>
      <button onClick={() => setSentCount((c) => c + 1)}>Send</button>
    </p>
  );
};

export const App2 = () => {
  const [showChat, setShowChat] = useState(true);
  const [connection, setConnection] = useState<Connection>('disconnected');

  return (
    <div>
      <p>
        <button onClick={() => setShowChat((s) => !s)}>
          {showChat ? 'Hide' : 'Show'} chat
        </button>
      </p>
      <dl>
        <dt>Chat</dt>
        <dd>{showChat ? 'visible' : 'hidden'}</dd>
        <dt>Effect</dt>
        <dd>{connection}</dd>
      </dl>
      <Activity mode={showChat ? 'visible' : 'hidden'}>
        <ChatRoom onConnectionChange={setConnection} />
      </Activity>
    </div>
  );
};
