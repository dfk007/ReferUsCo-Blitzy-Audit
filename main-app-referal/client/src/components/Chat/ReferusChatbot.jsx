import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// ─── Referus Knowledge Base (Rule-Based Responses) ───────────────────────────
const REFERUS_KB = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'howdy', 'greetings', 'sup', "what's up"],
    response:
      '👋 Hey! Welcome to **Referus** — the referral platform that turns your network into revenue. Ask me anything about how it works, our features, pricing, or how to get started!',
  },
  what_is: {
    patterns: [
      'what is referus',
      'what does referus do',
      'tell me about referus',
      'explain referus',
      'about referus',
      'what is this',
    ],
    response:
      '**Referus.co** is a B2B referral automation platform that helps businesses launch, manage, and scale referral programs. You can:\n\n• 🎯 Create branded referral campaigns in minutes\n• 🔗 Generate unique tracking links for every referrer\n• 💰 Automate reward payouts (cash, credits, gifts)\n• 📊 Track conversions and ROI in real-time\n• 🔌 Integrate with your existing stack via webhooks & API',
  },
  how_it_works: {
    patterns: [
      'how does it work',
      'how it works',
      'how do i use it',
      'getting started',
      'get started',
      'how to start',
      'walkthrough',
      'setup',
    ],
    response:
      'Getting started with Referus is simple:\n\n**1. Create a Campaign** — Set your reward structure, referral conditions, and branding\n**2. Share Your Link** — Invite referrers via email, your app, or direct link\n**3. Track & Convert** — Every click and conversion is tracked in your dashboard\n**4. Auto-Pay Rewards** — Rewards trigger automatically when conditions are met\n\n🚀 Most teams go live in under 30 minutes.',
  },
  features: {
    patterns: [
      'features',
      'what can it do',
      'capabilities',
      'functionality',
      'what does it offer',
    ],
    response:
      '**Core Referus Features:**\n\n🔗 **Unique Tracking Links** — Per-referrer links with UTM auto-tagging\n🎁 **Flexible Rewards** — Cash, credits, discounts, or custom rewards\n📊 **Live Analytics** — Conversion funnels, referrer leaderboards, ROI\n🔔 **Smart Notifications** — Email/SMS triggers for referrers and referees\n🔌 **API & Webhooks** — Integrate with Stripe, HubSpot, Salesforce, Zapier\n🎨 **White-Label UI** — Branded referral portals matching your design\n👥 **Multi-tier Referrals** — Reward chains for ambassador programs\n🛡️ **Fraud Detection** — Built-in abuse prevention & duplicate detection',
  },
  pricing: {
    patterns: [
      'pricing',
      'price',
      'cost',
      'how much',
      'plans',
      'free',
      'paid',
      'subscription',
    ],
    response:
      'Referus offers flexible pricing:\n\n✅ **Starter (Free)** — Up to 50 referrals/mo, 1 campaign, basic analytics\n🚀 **Growth ($49/mo)** — Unlimited referrals, 10 campaigns, API access\n🏢 **Business ($149/mo)** — White-label, priority support, advanced fraud detection\n💼 **Enterprise** — Custom pricing, SLA, dedicated account manager\n\n👉 All plans include a 14-day free trial — no credit card required.',
  },
  integrations: {
    patterns: [
      'integration',
      'integrate',
      'connect',
      'api',
      'webhook',
      'zapier',
      'hubspot',
      'stripe',
      'salesforce',
      'slack',
    ],
    response:
      '**Referus Integrations:**\n\n💳 **Payments:** Stripe, PayPal, Wise for automated payouts\n📧 **Email:** Mailchimp, SendGrid, Postmark\n🤝 **CRM:** HubSpot, Salesforce, Pipedrive\n⚡ **Automation:** Zapier, Make (Integromat), n8n\n💬 **Comms:** Slack, Discord webhooks\n🛒 **E-commerce:** Shopify, WooCommerce\n🔌 **Custom:** REST API + Webhooks for anything else\n\nFull API docs at docs.referus.co',
  },
  analytics: {
    patterns: [
      'analytics',
      'dashboard',
      'reports',
      'tracking',
      'metrics',
      'data',
      'stats',
      'statistics',
    ],
    response:
      '**Referus Analytics Dashboard:**\n\n📈 **Conversion Funnel** — See every step from click → signup → purchase\n🏆 **Referrer Leaderboard** — Gamify your top advocates\n💰 **Revenue Attribution** — Track exact revenue from each campaign\n🌍 **Geo Analytics** — Where are your referrals coming from?\n⏱️ **Time-to-Convert** — Optimize your funnel timing\n📤 **CSV Export** — Pull raw data any time\n\nAll metrics update in real-time.',
  },
  rewards: {
    patterns: [
      'reward',
      'payout',
      'commission',
      'earn',
      'money',
      'credit',
      'incentive',
      'bonus',
    ],
    response:
      "**Referus Reward Types:**\n\n💵 **Cash** — Direct bank transfer or PayPal\n🎟️ **Account Credits** — Applied to the referrer's next invoice\n🎁 **Gift Cards** — Amazon, Visa, hundreds of brands\n📉 **Discounts** — % or flat off for both parties (double-sided)\n🏅 **Custom** — Points, swag, access upgrades — you define it\n\nRewards can be set to trigger on signup, trial start, first payment, or custom events via webhook.",
  },
  security: {
    patterns: [
      'security',
      'fraud',
      'safe',
      'trust',
      'abuse',
      'fake',
      'protection',
      'gdpr',
      'compliance',
    ],
    response:
      '**Referus Security & Compliance:**\n\n🛡️ **Fraud Detection** — IP fingerprinting, device ID, email pattern matching\n🚫 **Self-Referral Blocking** — Prevents gaming the system\n📋 **GDPR Compliant** — Data processing agreements, right-to-erasure\n🔒 **SOC 2 Type II** — Enterprise security audit certified\n🔐 **SSO** — SAML 2.0 / Google OAuth for team access\n📧 **Email Verification** — Referees must verify before rewards unlock',
  },
  support: {
    patterns: [
      'support',
      'help',
      'contact',
      'talk to someone',
      'human',
      'agent',
      'ticket',
    ],
    response:
      '**Referus Support:**\n\n💬 **Live Chat** — You\'re in it right now! Average response < 2 min\n📧 **Email** — support@referus.co\n📚 **Docs** — docs.referus.co (guides, API reference, tutorials)\n🎥 **Video Tutorials** — YouTube channel with step-by-step walkthroughs\n📞 **Enterprise** — Dedicated account manager + phone support\n\nWant me to connect you with a human agent?',
  },
  demo: {
    patterns: [
      'demo',
      'trial',
      'test',
      'try',
      'sample',
      'example',
      'see it',
    ],
    response:
      '🎯 **Try Referus Free:**\n\n1. Visit **referus.co** and click \'Start Free Trial\'\n2. Create your first campaign in the guided setup (5 min)\n3. Share your unique referral link with 3 contacts\n4. Watch conversions track in real-time in your dashboard\n\nNo credit card required. 14-day full-access trial on the Growth plan.\n\n👉 Or [book a 30-min demo](https://referus.co/demo) with our team.',
  },
};

const QUICK_REPLIES = [
  { label: 'What is Referus?', key: 'what_is' },
  { label: 'How does it work?', key: 'how_it_works' },
  { label: 'View pricing', key: 'pricing' },
  { label: 'See integrations', key: 'integrations' },
  { label: 'Reward types', key: 'rewards' },
  { label: 'Book a demo', key: 'demo' },
];

function matchKB(input) {
  const lower = input.toLowerCase().trim();
  for (const [, entry] of Object.entries(REFERUS_KB)) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.response;
    }
  }
  return null;
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-1.5 mb-0.5">
          <span className="text-green-600 font-bold min-w-[12px]">•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
        </div>
      );
    }
    if (line === '')
      return <div key={i} className="h-1.5" />;
    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: line }}
        className="mb-0.5"
      />
    );
  });
}

const FALLBACK_MESSAGE =
  "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚";

export default function ReferusChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm the **Referus** support assistant. I can help with features, pricing, integrations, and getting your referral program live.\n\nWhat would you like to know?",
      id: 0,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    setShowQuickReplies(false);
    const userMsg = { role: 'user', content: text, id: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    const kbAnswer = matchKB(text);
    if (kbAnswer) {
      setTimeout(() => {
        setMessages([
          ...history,
          { role: 'assistant', content: kbAnswer, id: Date.now() + 1 },
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    const apiHistory = history
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const { data } = await axios.post(`${API_BASE_URL}/chat/ai`, {
        messages: apiHistory,
      });
      const aiReply = data?.reply?.trim() || null;
      const finalReply = aiReply || FALLBACK_MESSAGE;
      setMessages([
        ...history,
        { role: 'assistant', content: finalReply, id: Date.now() + 1 },
      ]);
    } catch {
      setMessages([
        ...history,
        { role: 'assistant', content: FALLBACK_MESSAGE, id: Date.now() + 1 },
      ]);
    }
    setLoading(false);
  }

  function handleQuickReply(key) {
    const entry = REFERUS_KB[key];
    if (!entry) return;
    setShowQuickReplies(false);
    const label = QUICK_REPLIES.find((q) => q.key === key)?.label || key;
    const userMsg = { role: 'user', content: label, id: Date.now() };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', content: entry.response, id: Date.now() + 1 },
    ]);
  }

  return (
    <>
      <div className="referus-chatbot-root fixed bottom-6 right-6 z-[9999]">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="referus-chatbot-launcher w-[60px] h-[60px] rounded-full border-0 cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-[1.08] shadow-[0_4px_20px_rgba(22,163,74,0.45)] animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
            }}
            aria-label="Open Referus chat"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.15)"
              />
            </svg>
          </button>
        )}

        {open && (
          <div
            className="referus-chatbot-window w-[370px] h-[560px] bg-white rounded-2xl flex flex-col overflow-hidden text-sm animate-chatbot-slide-up"
            style={{
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-white/40"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  R
                </div>
                <div>
                  <div className="text-white font-bold text-[15px] tracking-wide">
                    Referus Support Chat
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: '#86efac',
                        boxShadow: '0 0 0 2px rgba(134,239,172,0.4)',
                      }}
                    />
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: '#bbf7d0' }}
                    >
                      Online — typically replies instantly
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-base cursor-pointer hover:bg-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-2.5 bg-gray-50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      }}
                    >
                      R
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-3 py-2.5 rounded-2xl shadow-sm leading-snug"
                    style={{
                      borderRadius:
                        msg.role === 'user'
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #16a34a, #15803d)'
                          : '#ffffff',
                      color: msg.role === 'user' ? 'white' : '#1f2937',
                    }}
                  >
                    {msg.role === 'assistant'
                      ? renderMarkdown(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{
                      background:
                        'linear-gradient(135deg, #16a34a, #15803d)',
                    }}
                  >
                    R
                  </div>
                  <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md shadow-sm flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`w-[7px] h-[7px] rounded-full bg-green-600 inline-block animate-chatbot-bounce ${
                          i === 0 ? 'delay-0' : i === 1 ? 'delay-200' : 'delay-[400ms]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showQuickReplies && !loading && (
                <div className="mt-1">
                  <div className="text-gray-400 text-[11px] mb-2 font-medium">
                    QUICK QUESTIONS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr.key}
                        type="button"
                        onClick={() => handleQuickReply(qr.key)}
                        className="px-3 py-1.5 rounded-full border-2 border-green-600 bg-white text-green-600 cursor-pointer text-xs font-semibold transition-all duration-150 whitespace-nowrap hover:bg-green-600 hover:text-white"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3.5 py-3 bg-white border-t border-gray-200 flex gap-2 items-end">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  sendMessage(input)
                }
                placeholder="Ask about Referus..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-3xl border-2 border-gray-200 outline-none bg-gray-50 text-sm transition-colors focus:border-green-600"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full border-0 flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    input.trim() && !loading
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : '#e5e7eb',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                }}
                aria-label="Send message"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M22 2L11 13"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center py-1.5 bg-white text-gray-400 text-[11px] border-t border-gray-100">
              Powered by{' '}
              <strong className="text-green-600">Referus</strong> · AI-assisted
              support
            </div>
          </div>
        )}
      </div>
    </>
  );
}
