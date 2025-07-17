import { users, chatSessions, messages, type User, type InsertUser, type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserBySessionId(sessionId: string): Promise<User | undefined>;
  getUserByDeviceFingerprint(fingerprint: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremium(id: number, isPremium: boolean, expiresAt?: Date): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;
  updateUserEmail(id: number, email: string): Promise<User>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getActiveChatSessionForUser(userId: number): Promise<ChatSession | undefined>;
  endChatSession(id: number): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: number): Promise<Message[]>;
  
  // Matching operations
  getWaitingUsers(): Promise<User[]>;
  getOnlineUsersCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatSessions: Map<number, ChatSession>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentChatSessionId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatSessionId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.sessionId === sessionId);
  }

  async getUserByDeviceFingerprint(fingerprint: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.deviceFingerprint === fingerprint);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      sessionId: insertUser.sessionId,
      deviceFingerprint: insertUser.deviceFingerprint,
      email: insertUser.email || null,
      isAnonymous: insertUser.isAnonymous ?? true,
      isPremium: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      premiumExpiresAt: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPremium(id: number, isPremium: boolean, expiresAt?: Date): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, isPremium, premiumExpiresAt: expiresAt || null };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserEmail(id: number, email: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, email };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentChatSessionId++;
    const session: ChatSession = {
      ...insertSession,
      id,
      isActive: true,
      createdAt: new Date(),
      endedAt: null,
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getActiveChatSessionForUser(userId: number): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values()).find(
      session => session.isActive && (session.user1Id === userId || session.user2Id === userId)
    );
  }

  async endChatSession(id: number): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      const updatedSession = { ...session, isActive: false, endedAt: new Date() };
      this.chatSessions.set(id, updatedSession);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      sessionId: insertMessage.sessionId,
      senderId: insertMessage.senderId,
      content: insertMessage.content,
      messageType: insertMessage.messageType || 'text',
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySessionId(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getWaitingUsers(): Promise<User[]> {
    const activeSessions = Array.from(this.chatSessions.values()).filter(s => s.isActive);
    const activeUserIds = new Set([
      ...activeSessions.map(s => s.user1Id),
      ...activeSessions.map(s => s.user2Id)
    ]);
    
    return Array.from(this.users.values()).filter(user => !activeUserIds.has(user.id));
  }

  async getOnlineUsersCount(): Promise<number> {
    return this.users.size;
  }
}

export const storage = new MemStorage();
