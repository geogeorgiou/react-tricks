import { Activity, useEffect, useState } from 'react';

const ChatRoom = () => {
  const [messages, setMessages] = useState(0);

  useEffect(() => {
    console.log('connected');
    return () => console.log('disconnected');
  }, []);

  return (
    <div>
      <p>Messages sent: {messages}</p>
      <button onClick={() => setMessages((m) => m + 1)}>Send</button>
    </div>
  );
};

export const App3 = () => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide' : 'Show'} chat
      </button>
      <Activity mode={open ? 'visible' : 'hidden'}>
        <ChatRoom />
      </Activity>
    </div>
  );
};
