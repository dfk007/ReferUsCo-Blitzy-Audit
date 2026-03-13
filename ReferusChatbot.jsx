import { useState, useRef, useEffect } from "react";

// ─── Referus Knowledge Base (Rule-Based Responses) ───────────────────────────
const REFERUS_KB = {
  greetings: {
    patterns: ["hi", "hello", "hey", "howdy", "greetings", "sup", "what's up"],
    response: "👋 Hey! Welcome to **Referus** — the referral platform that turns your network into revenue. Ask me anything about how it works, our features, pricing, or how to get started!",
  },
  what_is: {
    patterns: ["what is referus", "what does referus do", "tell me about referus", "explain referus", "about referus", "what is this"],
    response: "**Referus.co** is a B2B referral automation platform that helps businesses launch, manage, and scale referral programs. You can:\n\n• 🎯 Create branded referral campaigns in minutes\n• 🔗 Generate unique tracking links for every referrer\n• 💰 Automate reward payouts (cash, credits, gifts)\n• 📊 Track conversions and ROI in real-time\n• 🔌 Integrate with your existing stack via webhooks & API",
  },
  how_it_works: {
    patterns: ["how does it work", "how it works", "how do i use it", "getting started", "get started", "how to start", "walkthrough", "setup"],
    response: "Getting started with Referus is simple:\n\n**1. Create a Campaign** — Set your reward structure, referral conditions, and branding\n**2. Share Your Link** — Invite referrers via email, your app, or direct link\n**3. Track & Convert** — Every click and conversion is tracked in your dashboard\n**4. Auto-Pay Rewards** — Rewards trigger automatically when conditions are met\n\n🚀 Most teams go live in under 30 minutes.",
  },
  features: {
    patterns: ["features", "what can it do", "capabilities", "functionality", "what does it offer"],
    response: "**Core Referus Features:**\n\n🔗 **Unique Tracking Links** — Per-referrer links with UTM auto-tagging\n🎁 **Flexible Rewards** — Cash, credits, discounts, or custom rewards\n📊 **Live Analytics** — Conversion funnels, referrer leaderboards, ROI\n🔔 **Smart Notifications** — Email/SMS triggers for referrers and referees\n🔌 **API & Webhooks** — Integrate with Stripe, HubSpot, Salesforce, Zapier\n🎨 **White-Label UI** — Branded referral portals matching your design\n👥 **Multi-tier Referrals** — Reward chains for ambassador programs\n🛡️ **Fraud Detection** — Built-in abuse prevention & duplicate detection",
  },
  pricing: {
    patterns: ["pricing", "price", "cost", "how much", "plans", "free", "paid", "subscription"],
    response: "Referus offers flexible pricing:\n\n✅ **Starter (Free)** — Up to 50 referrals/mo, 1 campaign, basic analytics\n🚀 **Growth ($49/mo)** — Unlimited referrals, 10 campaigns, API access\n🏢 **Business ($149/mo)** — White-label, priority support, advanced fraud detection\n💼 **Enterprise** — Custom pricing, SLA, dedicated account manager\n\n👉 All plans include a 14-day free trial — no credit card required.",
  },
  integrations: {
    patterns: ["integration", "integrate", "connect", "api", "webhook", "zapier", "hubspot", "stripe", "salesforce", "slack"],
    response: "**Referus Integrations:**\n\n💳 **Payments:** Stripe, PayPal, Wise for automated payouts\n📧 **Email:** Mailchimp, SendGrid, Postmark\n🤝 **CRM:** HubSpot, Salesforce, Pipedrive\n⚡ **Automation:** Zapier, Make (Integromat), n8n\n💬 **Comms:** Slack, Discord webhooks\n🛒 **E-commerce:** Shopify, WooCommerce\n🔌 **Custom:** REST API + Webhooks for anything else\n\nFull API docs at docs.referus.co",
  },
  analytics: {
    patterns: ["analytics", "dashboard", "reports", "tracking", "metrics", "data", "stats", "statistics"],
    response: "**Referus Analytics Dashboard:**\n\n📈 **Conversion Funnel** — See every step from click → signup → purchase\n🏆 **Referrer Leaderboard** — Gamify your top advocates\n💰 **Revenue Attribution** — Track exact revenue from each campaign\n🌍 **Geo Analytics** — Where are your referrals coming from?\n⏱️ **Time-to-Convert** — Optimize your funnel timing\n📤 **CSV Export** — Pull raw data any time\n\nAll metrics update in real-time.",
  },
  rewards: {
    patterns: ["reward", "payout", "commission", "earn", "money", "credit", "incentive", "bonus"],
    response: "**Referus Reward Types:**\n\n💵 **Cash** — Direct bank transfer or PayPal\n🎟️ **Account Credits** — Applied to the referrer's next invoice\n🎁 **Gift Cards** — Amazon, Visa, hundreds of brands\n📉 **Discounts** — % or flat off for both parties (double-sided)\n🏅 **Custom** — Points, swag, access upgrades — you define it\n\nRewards can be set to trigger on signup, trial start, first payment, or custom events via webhook.",
  },
  security: {
    patterns: ["security", "fraud", "safe", "trust", "abuse", "fake", "protection", "gdpr", "compliance"],
    response: "**Referus Security & Compliance:**\n\n🛡️ **Fraud Detection** — IP fingerprinting, device ID, email pattern matching\n🚫 **Self-Referral Blocking** — Prevents gaming the system\n📋 **GDPR Compliant** — Data processing agreements, right-to-erasure\n🔒 **SOC 2 Type II** — Enterprise security audit certified\n🔐 **SSO** — SAML 2.0 / Google OAuth for team access\n📧 **Email Verification** — Referees must verify before rewards unlock",
  },
  support: {
    patterns: ["support", "help", "contact", "talk to someone", "human", "agent", "ticket"],
    response: "**Referus Support:**\n\n💬 **Live Chat** — You're in it right now! Average response < 2 min\n📧 **Email** — support@referus.co\n📚 **Docs** — docs.referus.co (guides, API reference, tutorials)\n🎥 **Video Tutorials** — YouTube channel with step-by-step walkthroughs\n📞 **Enterprise** — Dedicated account manager + phone support\n\nWant me to connect you with a human agent?",
  },
  demo: {
    patterns: ["demo", "trial", "test", "try", "sample", "example", "see it"],
    response: "🎯 **Try Referus Free:**\n\n1. Visit **referus.co** and click 'Start Free Trial'\n2. Create your first campaign in the guided setup (5 min)\n3. Share your unique referral link with 3 contacts\n4. Watch conversions track in real-time in your dashboard\n\nNo credit card required. 14-day full-access trial on the Growth plan.\n\n👉 Or [book a 30-min demo](https://referus.co/demo) with our team.",
  },
};

// ─── Quick Reply Chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  { label: "What is Referus?", key: "what_is" },
  { label: "How does it work?", key: "how_it_works" },
  { label: "View pricing", key: "pricing" },
  { label: "See integrations", key: "integrations" },
  { label: "Reward types", key: "rewards" },
  { label: "Book a demo", key: "demo" },
];

// ─── Rule-Based Matcher ───────────────────────────────────────────────────────
function matchKB(input) {
  const lower = input.toLowerCase().trim();
  for (const [, entry] of Object.entries(REFERUS_KB)) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.response;
    }
  }
  return null;
}

// ─── Markdown-lite Renderer ───────────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Bullet
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
          <span style={{ color: "#22c55e", fontWeight: 700, minWidth: 12 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
        </div>
      );
    }
    if (line === "") return <div key={i} style={{ height: 6 }} />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: line }} style={{ marginBottom: 1 }} />;
  });
}

// ─── AI Fallback (Claude API) ─────────────────────────────────────────────────
async function askClaude(messages) {
  const systemPrompt = `You are Referus Support — the AI assistant for Referus.co, a B2B referral automation platform. 
You are helpful, concise, and knowledgeable about referral marketing, SaaS growth, and the Referus platform.
Keep answers under 150 words. Use bullet points for lists. Stay focused on Referus features, pricing, onboarding, integrations, and referral marketing best practices.
If asked anything unrelated to Referus or business software, politely redirect.
Referus key facts: B2B referral platform, free tier available, integrates with Stripe/HubSpot/Zapier, white-label ready, fraud detection built-in, real-time analytics, API + webhooks.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    if (data.content?.[0]?.text) return data.content[0].text;
    return null;
  } catch {
    return null;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReferusChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm the **Referus** support assistant. I can help with features, pricing, integrations, and getting your referral program live.\n\nWhat would you like to know?",
      id: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    setShowQuickReplies(false);
    const userMsg = { role: "user", content: text, id: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    // 1. Try rule-based KB first (instant, free)
    const kbAnswer = matchKB(text);
    if (kbAnswer) {
      setTimeout(() => {
        setMessages([...history, { role: "assistant", content: kbAnswer, id: Date.now() + 1 }]);
        setLoading(false);
      }, 400);
      return;
    }

    // 2. Fall back to Claude API
    const apiHistory = history
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const aiReply = await askClaude(apiHistory);
    const finalReply =
      aiReply ||
      "I'm not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co** 📚";

    setMessages([...history, { role: "assistant", content: finalReply, id: Date.now() + 1 }]);
    setLoading(false);
  }

  function handleQuickReply(key) {
    const entry = REFERUS_KB[key];
    if (!entry) return;
    const label = QUICK_REPLIES.find((q) => q.key === key)?.label || key;
    setShowQuickReplies(false);
    const userMsg = { role: "user", content: label, id: Date.now() };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: entry.response, id: Date.now() + 1 },
    ]);
  }

  return (
    <>
      {/* ── Launcher Button ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(22,163,74,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              animation: "pulse 2s infinite",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Open Referus chat"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.15)"/>
            </svg>
          </button>
        )}

        {/* ── Chat Window ── */}
        {open && (
          <div
            style={{
              width: 370,
              height: 560,
              background: "#ffffff",
              borderRadius: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: 14,
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Logo / Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                    border: "2px solid rgba(255,255,255,0.4)",
                  }}
                >
                  R
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>
                    Referus Support Chat
                  </div>
                  {/* Online Indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#86efac",
                        display: "inline-block",
                        boxShadow: "0 0 0 2px rgba(134,239,172,0.4)",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <span style={{ color: "#bbf7d0", fontSize: 12, fontWeight: 500 }}>
                      Online — typically replies instantly
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 6,
                  color: "white",
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "#f9fafb",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      R
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 13px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "linear-gradient(135deg, #16a34a, #15803d)" : "#ffffff",
                      color: msg.role === "user" ? "white" : "#1f2937",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    R
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "white",
                      borderRadius: "16px 16px 16px 4px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      display: "flex",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#16a34a",
                          display: "inline-block",
                          animation: `bounce 1.2s ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {showQuickReplies && !loading && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8, fontWeight: 500 }}>
                    QUICK QUESTIONS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr.key}
                        onClick={() => handleQuickReply(qr.key)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 20,
                          border: "1.5px solid #16a34a",
                          background: "white",
                          color: "#16a34a",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#16a34a";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#16a34a";
                        }}
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "12px 14px",
                background: "white",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about Referus..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 24,
                  border: "1.5px solid #e5e7eb",
                  outline: "none",
                  fontSize: 14,
                  background: "#f9fafb",
                  transition: "border-color 0.15s",
                  resize: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: input.trim() && !loading ? "linear-gradient(135deg, #16a34a, #15803d)" : "#e5e7eb",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                aria-label="Send message"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                padding: "6px",
                background: "white",
                color: "#9ca3af",
                fontSize: 11,
                borderTop: "1px solid #f3f4f6",
              }}
            >
              Powered by <strong style={{ color: "#16a34a" }}>Referus</strong> · AI-assisted support
            </div>
          </div>
        )}
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
