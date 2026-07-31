import React, { useState } from 'react';
import { MessageSquare, Pin, ThumbsUp, Send, Hash, Tag, Plus } from 'lucide-react';
import { TeamDiscussion, Employee } from '../../types';

interface TeamDiscussionsProps {
  discussions: TeamDiscussion[];
  currentEmployee: Employee;
  onPostDiscussion: (disc: TeamDiscussion) => void;
  onAddReply: (discId: string, replyContent: string) => void;
}

export const TeamDiscussions: React.FC<TeamDiscussionsProps> = ({
  discussions,
  currentEmployee,
  onPostDiscussion,
  onAddReply,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [newContent, setNewContent] = useState('');
  const [newChannel, setNewChannel] = useState<'general' | 'seo-squad' | 'dev-squad' | 'billing-alerts' | 'announcements'>('general');
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  const filteredDiscussions = discussions.filter((d) => {
    if (selectedChannel === 'all') return true;
    return d.channel === selectedChannel;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newDisc: TeamDiscussion = {
      id: `disc-${Date.now()}`,
      authorId: currentEmployee.id,
      authorName: currentEmployee.name,
      authorAvatar: currentEmployee.avatar,
      authorRole: currentEmployee.role,
      content: newContent,
      timestamp: 'Just now',
      channel: newChannel,
      likesCount: 0,
      isPinned: false,
      tag: `#${newChannel}`,
      replies: [],
    };

    onPostDiscussion(newDisc);
    setNewContent('');
  };

  const handleReplySubmit = (discId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = replyInputs[discId];
    if (!text || !text.trim()) return;

    onAddReply(discId, text);
    setReplyInputs({ ...replyInputs, [discId]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header & Channels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            TopRank Team Discussion Board
          </h2>
          <p className="text-xs text-slate-500">
            Share technical updates, client billing notices, and department discussions
          </p>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          {[
            { key: 'all', label: 'All Discussions' },
            { key: 'billing-alerts', label: '🚨 #billing-alerts' },
            { key: 'seo-squad', label: '#seo-squad' },
            { key: 'dev-squad', label: '#dev-squad' },
            { key: 'general', label: '#general' },
            { key: 'announcements', label: '📢 #announcements' },
          ].map((ch) => (
            <button
              key={ch.key}
              onClick={() => setSelectedChannel(ch.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedChannel === ch.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post New Discussion Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm">
        <form onSubmit={handlePostSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={currentEmployee.avatar}
                alt={currentEmployee.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-900">{currentEmployee.name}</span>
            </div>

            <select
              value={newChannel}
              onChange={(e: any) => setNewChannel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-blue-600 rounded-xl px-3 py-1.5 font-semibold"
            >
              <option value="general">#general</option>
              <option value="billing-alerts">#billing-alerts</option>
              <option value="seo-squad">#seo-squad</option>
              <option value="dev-squad">#dev-squad</option>
              <option value="announcements">#announcements</option>
            </select>
          </div>

          <textarea
            rows={3}
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share a project update, question, or announcement with the team..."
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl p-3 focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow"
            >
              <Send size={14} />
              Post Message
            </button>
          </div>
        </form>
      </div>

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        {filteredDiscussions.map((disc) => (
          <div
            key={disc.id}
            className={`bg-white border rounded-2xl p-5 text-slate-900 shadow-sm space-y-4 transition-all ${
              disc.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={disc.authorAvatar}
                  alt={disc.authorName}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{disc.authorName}</h4>
                    <span className="text-[10px] bg-slate-100 text-blue-600 px-2 py-0.5 rounded font-bold">
                      {disc.authorRole}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{disc.timestamp}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {disc.isPinned && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Pin size={11} /> Pinned
                  </span>
                )}
                <span className="bg-slate-50 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200">
                  #{disc.channel}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {disc.content}
            </p>

            {/* Replies List */}
            {disc.replies && disc.replies.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Replies ({disc.replies.length}):
                </span>
                {disc.replies.map((rep) => (
                  <div key={rep.id} className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">{rep.authorName}</span>
                      <span className="text-[10px] text-slate-500">{rep.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] mt-0.5">{rep.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Reply Input */}
            <form onSubmit={(e) => handleReplySubmit(disc.id, e)} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyInputs[disc.id] || ''}
                onChange={(e) =>
                  setReplyInputs({ ...replyInputs, [disc.id]: e.target.value })
                }
                className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Reply
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
};
