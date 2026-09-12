import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/hooks/useAuth';
import { apiClient } from '../services/api.client';
import { auth } from '../config/firebase';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    let newSocket: Socket | null = null;
    
    const initSocket = async () => {
      if (user) {
        fetchNotifications();
  
        let token = '';
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }
  
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        newSocket = io(backendUrl, {
          auth: { token },
          withCredentials: true,
        });
  
        newSocket.on('connect', () => {
          console.log('Socket.IO Connected');
        });
  
        newSocket.on('notification', (newNotification: Notification) => {
          setNotifications((prev) => [newNotification, ...prev]);
        });
  
        setSocket(newSocket);
      } else {
        setNotifications([]);
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      }
    };

    initSocket();
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
