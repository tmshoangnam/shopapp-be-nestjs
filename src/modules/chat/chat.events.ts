export const ChatEvents = {
  SEND_MESSAGE: 'send-message',
  MESSAGE_SENT: 'message-sent',
  NEW_MESSAGE: 'new-message',
  USER_CONNECTED: 'user-connected',
  USER_RECONNECTED: 'user-reconnected',
  USER_DISCONNECTED: 'user-disconnected',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  USER_TYPING: 'user-typing',
  UNREAD_COUNT: 'unread-count',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  MARK_AS_READ: 'mark-as-read',
  PING: 'ping',
} as const;

export type ChatEventKeys = keyof typeof ChatEvents;

