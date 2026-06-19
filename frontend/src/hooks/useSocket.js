import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (handlers = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const bind = (event, callback) => {
      if (callback) socket.on(event, callback);
    };

    bind('order:created', handlersRef.current.onOrderCreated);
    bind('order:updated', handlersRef.current.onOrderUpdated);
    bind('payment:success', handlersRef.current.onPaymentSuccess);

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinKitchen = () => socketRef.current?.emit('join:kitchen');
  const joinTable = (tableNumber) => socketRef.current?.emit('join:table', tableNumber);

  return { socket: socketRef.current, joinKitchen, joinTable };
};
