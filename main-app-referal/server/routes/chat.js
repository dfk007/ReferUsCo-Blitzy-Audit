const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// System prompt for AI fallback (free cloud LLM)
const CHATBOT_SYSTEM_PROMPT = `You are Referus Support — the AI assistant for Referus.co, a B2B referral automation platform.
You are helpful, concise, and knowledgeable about referral marketing, SaaS growth, and the Referus platform.
Keep answers under 150 words. Use bullet points for lists. Stay focused on Referus features, pricing, onboarding, integrations, and referral marketing best practices.
If asked anything unrelated to Referus or business software, politely redirect.
Referus key facts: B2B referral platform, free tier available, integrates with Stripe/HubSpot/Zapier, white-label ready, fraud detection built-in, real-time analytics, API + webhooks.`;

// @route   POST /api/chat/ai
// @desc    AI fallback for support chatbot (free cloud LLM — Groq). No auth required for public widget.
// @access  Public
router.post('/ai', [
  body('messages').isArray().withMessage('messages must be an array'),
  body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid role'),
  body('messages.*.content').isString().withMessage('content must be string'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'At least one message required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚 (AI fallback not configured.)",
      });
    }

    // Groq OpenAI-compatible API (free tier)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant',
        max_tokens: 500,
        messages: [
          { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return res.status(502).json({
        reply: "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚",
      });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || null;
    if (!reply) {
      return res.json({
        reply: "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚",
      });
    }
    return res.json({ reply });
  } catch (err) {
    console.error('Chat AI error:', err);
    return res.status(500).json({
      reply: "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚",
    });
  }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, [
  body('receiverId').isMongoId().withMessage('Valid receiver ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, message } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    await chatMessage.populate('sender', 'name email');
    await chatMessage.populate('receiver', 'name email');

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get all unique users the current user has chatted with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// @route   GET /api/chat/messages/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get messages between current user and the other user
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await ChatMessage.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   GET /api/chat/admin/users
// @desc    Get all users for admin chat
// @access  Private
router.get('/admin/users', protect, async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ role: 'user' })
      .select('name email')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users for admin chat error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
