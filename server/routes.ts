import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import { nanoid } from "nanoid";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
} as any);

// WebSocket connection management
const activeConnections = new Map<string, WebSocket>();
const userSessions = new Map<string, number>(); // sessionId -> userId

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const sessionId = urlParams.get('sessionId') || nanoid();
    const deviceFingerprint = urlParams.get('deviceFingerprint') || nanoid();
    
    activeConnections.set(sessionId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            await handleUserJoin(sessionId, deviceFingerprint, ws);
            break;
          case 'find_partner':
            await handleFindPartner(sessionId, ws);
            break;
          case 'send_message':
            await handleSendMessage(sessionId, message.content, ws);
            break;
          case 'disconnect':
            await handleDisconnect(sessionId);
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      activeConnections.delete(sessionId);
      userSessions.delete(sessionId);
    });
  });

  async function handleUserJoin(sessionId: string, deviceFingerprint: string, ws: WebSocket) {
    try {
      let user = await storage.getUserBySessionId(sessionId);
      
      // If no user by session, try to find by device fingerprint
      if (!user) {
        user = await storage.getUserByDeviceFingerprint(deviceFingerprint);
      }
      
      if (!user) {
        user = await storage.createUser({
          sessionId,
          deviceFingerprint,
          isAnonymous: true,
        });
      }
      
      userSessions.set(sessionId, user.id);
      
      ws.send(JSON.stringify({
        type: 'joined',
        user: { id: user.id, isPremium: user.isPremium, email: user.email }
      }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to join' }));
    }
  }

  async function handleFindPartner(sessionId: string, ws: WebSocket) {
    try {
      const userId = userSessions.get(sessionId);
      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
        return;
      }

      // End any existing active session
      const existingSession = await storage.getActiveChatSessionForUser(userId);
      if (existingSession) {
        await storage.endChatSession(existingSession.id);
      }

      // Find waiting users
      const waitingUsers = await storage.getWaitingUsers();
      const availableUsers = waitingUsers.filter(u => u.id !== userId);

      if (availableUsers.length === 0) {
        ws.send(JSON.stringify({ type: 'searching', message: 'Looking for partners...' }));
        return;
      }

      // Match with random user
      const partner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const chatSession = await storage.createChatSession({
        user1Id: userId,
        user2Id: partner.id,
      });

      // Notify both users
      const partnerSessionId = Array.from(userSessions.entries())
        .find(([_, id]) => id === partner.id)?.[0];

      if (partnerSessionId) {
        const partnerWs = activeConnections.get(partnerSessionId);
        if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
          partnerWs.send(JSON.stringify({
            type: 'partner_found',
            sessionId: chatSession.id,
            partner: { id: userId, isAnonymous: true }
          }));
        }
      }

      ws.send(JSON.stringify({
        type: 'partner_found',
        sessionId: chatSession.id,
        partner: { id: partner.id, isAnonymous: true }
      }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to find partner' }));
    }
  }

  async function handleSendMessage(sessionId: string, content: string, ws: WebSocket) {
    try {
      const userId = userSessions.get(sessionId);
      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
        return;
      }

      const chatSession = await storage.getActiveChatSessionForUser(userId);
      if (!chatSession) {
        ws.send(JSON.stringify({ type: 'error', message: 'No active chat session' }));
        return;
      }

      const message = await storage.createMessage({
        sessionId: chatSession.id,
        senderId: userId,
        content,
        messageType: 'text',
      });

      // Send to both users
      const partnerId = chatSession.user1Id === userId ? chatSession.user2Id : chatSession.user1Id;
      const partnerSessionId = Array.from(userSessions.entries())
        .find(([_, id]) => id === partnerId)?.[0];

      const messageData = {
        type: 'message',
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        }
      };

      // Send to sender
      ws.send(JSON.stringify(messageData));

      // Send to partner
      if (partnerSessionId) {
        const partnerWs = activeConnections.get(partnerSessionId);
        if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
          partnerWs.send(JSON.stringify(messageData));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
    }
  }

  async function handleDisconnect(sessionId: string) {
    const userId = userSessions.get(sessionId);
    if (userId) {
      const chatSession = await storage.getActiveChatSessionForUser(userId);
      if (chatSession) {
        await storage.endChatSession(chatSession.id);
        
        // Notify partner
        const partnerId = chatSession.user1Id === userId ? chatSession.user2Id : chatSession.user1Id;
        const partnerSessionId = Array.from(userSessions.entries())
          .find(([_, id]) => id === partnerId)?.[0];
        
        if (partnerSessionId) {
          const partnerWs = activeConnections.get(partnerSessionId);
          if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
            partnerWs.send(JSON.stringify({ type: 'partner_disconnected' }));
          }
        }
      }
    }
  }

  // REST API routes
  app.get('/api/users/me', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }

    try {
      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  app.put('/api/users/email', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }

    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if email is already in use
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      const updatedUser = await storage.updateUserEmail(user.id, email);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update email' });
    }
  });

  app.delete('/api/users/email', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }

    try {
      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await storage.updateUserEmail(user.id, '');
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove email' });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const onlineCount = await storage.getOnlineUsersCount();
      res.json({ onlineUsers: onlineCount });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get stats' });
    }
  });

  // Stripe subscription endpoint
  app.post('/api/create-subscription', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }

    try {
      let user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent']
        });
        const invoice = subscription.latest_invoice as any;
        res.json({
          subscriptionId: subscription.id,
          clientSecret: invoice?.payment_intent?.client_secret,
        });
        return;
      }

      const customer = await stripe.customers.create({
        metadata: { sessionId: user.sessionId },
      });

      user = await storage.updateUserStripeInfo(user.id, customer.id, '');

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook for subscription updates
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;
      
      // Update user premium status
      const user = Array.from(await storage.getWaitingUsers()).find(u => u.stripeCustomerId === customerId);
      if (user) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // Monthly subscription
        await storage.updateUserPremium(user.id, true, expiresAt);
      }
    }

    res.json({ received: true });
  });

  return httpServer;
}
