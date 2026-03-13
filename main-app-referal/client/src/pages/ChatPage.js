import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Support / Chat page. Primary support is via the floating ReferusChatbot widget
 * (bottom-right). This page directs users to it.
 */
const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Chat</h1>
          <p className="text-gray-600 mb-6">
            Get instant answers about Referus — features, pricing, integrations, and how to get started.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Use the <strong className="text-green-600">green chat button</strong> in the bottom-right corner of the page to open the support assistant.
          </p>
          <p className="text-sm text-gray-500">
            You can type your question or use the quick-reply options for common topics. We typically reply instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
