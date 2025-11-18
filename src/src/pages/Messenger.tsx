import React, { FormEvent, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils/cn";

interface ChatMessage {
  id: string;
  author: "executive" | "technician";
  content: string;
  time: string;
  attachments?: {
    id: string;
    type: "image" | "file";
    label: string;
    meta?: string;
    preview?: string;
  }[];
}

interface ChatThread {
  id: string;
  name: string;
  role: string;
  avatar: string;
  presence: "online" | "away" | "offline";
  snippet: string;
  time: string;
  unread?: number;
  typing?: boolean;
  tag?: string;
  channel: "direct" | "team";
  squad: string;
  messages: ChatMessage[];
}

const chatThreads: ChatThread[] = [
  {
    id: "andrew",
    name: "Andrew Bernard",
    role: "Executive · Ops HQ",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&h=200&q=80",
    presence: "online",
    snippet: "I am sorry, was trapped in a painting",
    time: "09:48",
    unread: 2,
    typing: false,
    tag: "Executive",
    channel: "direct",
    squad: "Infinity Ops",
    messages: [
      {
        id: "m-1",
        author: "executive",
        content:
          "Hey team, quick sync after the hull inspection? Would love a two-line summary before the board hops on.",
        time: "09:32",
      },
      {
        id: "m-2",
        author: "technician",
        content: "Pretty synced. Jose is taking point.",
        time: "09:35",
      },
      {
        id: "m-3",
        author: "technician",
        content: "Let's grab dinner after this week and you can tell me all about it.",
        time: "09:36",
      },
      {
        id: "m-4",
        author: "executive",
        content:
          "I'm sorry, I was trapped in a painting. Jokes aside, can you attach the latest field photo?",
        time: "09:42",
        attachments: [
          {
            id: "att-1",
            type: "image",
            label: "Dock 4 · Inspection day",
            meta: "Captured 08:10",
            preview:
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
      {
        id: "m-5",
        author: "technician",
        content: "Uploading now. Stand by.",
        time: "09:45",
      },
    ],
  },
  {
    id: "dwight",
    name: "Dwight Schrute",
    role: "Lead Technician · Field",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=200&h=200&q=80",
    presence: "away",
    snippet: "Standby, calibrating sensors...",
    time: "09:10",
    channel: "direct",
    squad: "Hull Diagnostics",
    messages: [],
  },
  {
    id: "ops-room",
    name: "Ops Situation Room",
    role: "Focus channel",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
    presence: "online",
    snippet: "Daily huddle starts in 12 minutes",
    time: "08:55",
    tag: "Daily",
    channel: "team",
    squad: "Executive Floor",
    messages: [],
  },
  {
    id: "supply",
    name: "Supply Chain Pod",
    role: "Workflow room",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=200&h=200&q=80",
    presence: "online",
    snippet: "Manifest uploaded to shared drive",
    time: "Yesterday",
    channel: "team",
    squad: "Materials",
    messages: [],
  },
  {
    id: "executive-bridge",
    name: "Executive Bridge",
    role: "Strategy updates",
    avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=200&h=200&q=80",
    presence: "offline",
    snippet: "Board approvals drop Friday",
    time: "Yesterday",
    channel: "team",
    squad: "HQ",
    messages: [],
  },
];

const pinnedMedia = [
  {
    id: "media-1",
    title: "Hull access panel",
    meta: "Shared by Dwight · 2h ago",
    preview: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "media-2",
    title: "Deck briefing",
    meta: "Shared by Pam · 1d ago",
    preview: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
  },
];

const sharedFiles = [
  {
    id: "file-1",
    name: "Executive handover plan.pdf",
    size: "2.1 MB",
    owner: "Andrew",
    time: "Shared 1h ago",
  },
  {
    id: "file-2",
    name: "Field readiness checklist.xlsx",
    size: "860 KB",
    owner: "Dwight",
    time: "Shared yesterday",
  },
  {
    id: "file-3",
    name: "Briefing talking points.docx",
    size: "540 KB",
    owner: "Kelly",
    time: "Shared Monday",
  },
];

const focusBlocks = [
  {
    id: "focus-1",
    title: "Ops standup",
    description: "Technicians + executive recap",
    time: "10:30",
  },
  {
    id: "focus-2",
    title: "Executive relay",
    description: "Upload annotated slides",
    time: "13:15",
  },
];

export function Messenger() {
  const [activeNav, setActiveNav] = useState("chats");
  const [selectedChatId, setSelectedChatId] = useState(chatThreads[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [composerValue, setComposerValue] = useState("");
  const [messageNotice, setMessageNotice] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chatThreads;
    }
    return chatThreads.filter((thread) =>
      [thread.name, thread.role, thread.snippet]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const selectedChat = useMemo(
    () => chatThreads.find((thread) => thread.id === selectedChatId) ?? chatThreads[0],
    [selectedChatId]
  );

  const handleComposerSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!composerValue.trim()) {
      setMessageNotice("Add a quick update before sending.");
      return;
    }
    setMessageNotice("Message queued to send over the secure relay.");
    setComposerValue("");
  };

  return (
    <AppShell>
      <div className="space-y-6" dir="ltr">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Internal office messenger</p>
            <h1 className="text-3xl font-semibold text-slate-900">Infinity Link</h1>
          </div>
          <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="rounded-2xl border-slate-200 text-slate-700"
                >
                  <Icon name="users" size={16} className="text-slate-500" />
                  Invite squad
                </Button>
            <Button className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
              <Icon name="spark" size={16} className="text-white" />
              Launch huddle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 min-h-[720px]">
          <section className="col-span-12 xl:col-span-2 bg-white/80 border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/60 p-5 flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=120&h=120&q=80"
                  alt="Ops lead"
                  className="w-12 h-12 rounded-2xl object-cover border border-white/30"
                />
                <div>
                  <p className="text-sm text-white/70">Connected as</p>
                  <p className="text-lg font-semibold">Ops relay</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <p>Executive line is live.</p>
                <p>Technicians synced across 4 workstreams.</p>
              </div>
              <Button
                variant="secondary"
                className="w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90 border-white/30"
              >
                Install Messenger App
              </Button>
            </div>

            <div className="space-y-2">
              {["chats", "ops", "workspace"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveNav(item)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium flex items-center gap-3",
                    activeNav === item
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  )}
                >
                  <Icon
                    name={item === "chats" ? "messageCircle" : item === "ops" ? "layers" : "spark"}
                    size={18}
                  />
                  {item === "chats"
                    ? "Direct messages"
                    : item === "ops"
                    ? "Ops channels"
                    : "Workspace"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus blocks</p>
              <div className="space-y-2">
                {focusBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">{block.title}</p>
                    <p className="text-xs text-slate-500">{block.description}</p>
                    <p className="text-xs text-slate-800 mt-2">{block.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="col-span-12 md:col-span-4 xl:col-span-3 bg-white/90 border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/60 p-5 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search teammates"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 py-2.5 pl-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <button className="w-10 h-10 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900">
                <Icon name="menu" size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {[
                { id: "exec", label: "Executives", color: "bg-emerald-100 text-emerald-700" },
                { id: "tech", label: "Technicians", color: "bg-blue-100 text-blue-700" },
                { id: "files", label: "Files", color: "bg-indigo-100 text-indigo-700" },
              ].map((pill) => (
                <span
                  key={pill.id}
                  className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    pill.color
                  )}
                >
                  {pill.label}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto pr-1">
              {filteredChats.map((thread) => {
                const isActive = thread.id === selectedChat?.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedChatId(thread.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
                      isActive
                        ? "border-slate-900 bg-slate-900/5 shadow-lg"
                        : "border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className="relative">
                      <img
                        src={thread.avatar}
                        alt={thread.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white",
                          thread.presence === "online"
                            ? "bg-emerald-400"
                            : thread.presence === "away"
                            ? "bg-amber-400"
                            : "bg-slate-400"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                        <span>{thread.name}</span>
                        <span className="text-xs text-slate-500">{thread.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{thread.snippet}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{thread.squad}</span>
                        {thread.tag && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {thread.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    {thread.unread && (
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                        {thread.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="col-span-12 md:col-span-5 xl:col-span-5 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/70 p-6 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChat?.avatar}
                  alt={selectedChat?.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <span>{selectedChat?.name}</span>
                    {selectedChat?.presence === "online" && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        Online now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{selectedChat?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-11 h-11 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900">
                  <Icon name="phone" size={18} />
                </button>
                <button className="w-11 h-11 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900">
                  <Icon name="video" size={18} />
                </button>
                <button className="w-11 h-11 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900">
                  <Icon name="bookmark" size={18} />
                </button>
                <button className="w-11 h-11 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900">
                  <Icon name="dots" size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {selectedChat?.channel === "direct" ? "Executive · Technician" : "Ops channel"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Secure relay
              </span>
              {selectedChat?.typing && <span>typing…</span>}
            </div>

            <div className="mt-6 flex-1 overflow-y-auto space-y-4">
              {selectedChat?.messages.map((message) => {
                const isExecutive = message.author === "executive";
                return (
                  <div
                    key={message.id}
                    className={cn("flex", isExecutive ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-3xl px-5 py-4 text-sm shadow-sm",
                        isExecutive
                          ? "bg-slate-100 text-slate-900"
                          : "bg-slate-900 text-white"
                      )}
                    >
                      <p>{message.content}</p>
                      {message.attachments && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="rounded-2xl overflow-hidden border border-white/20"
                            >
                              {attachment.type === "image" && attachment.preview ? (
                                <img
                                  src={attachment.preview}
                                  alt={attachment.label}
                                  className="w-full h-40 object-cover"
                                />
                              ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40">
                                  <Icon name="file" size={18} className="text-white/80" />
                                  <div>
                                    <p className="text-sm font-medium">{attachment.label}</p>
                                    {attachment.meta && (
                                      <p className="text-xs text-white/70">{attachment.meta}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] mt-3 opacity-70">{message.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleComposerSubmit} className="mt-6 space-y-2">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <button type="button" className="text-slate-500 hover:text-slate-700">
                  <Icon name="paperclip" size={18} />
                </button>
                <input
                  type="text"
                  value={composerValue}
                  onChange={(event) => {
                    setComposerValue(event.target.value);
                    setMessageNotice(null);
                  }}
                  placeholder="Drop a quick update to keep leadership in the loop"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button type="button" className="text-slate-500 hover:text-slate-700">
                  <Icon name="smile" size={18} />
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-medium flex items-center gap-2"
                >
                  Send
                  <Icon name="send" size={16} />
                </button>
              </div>
              {messageNotice && (
                <p className="text-xs text-slate-500">{messageNotice}</p>
              )}
            </form>
          </section>

          <section className="col-span-12 md:col-span-3 xl:col-span-2 bg-white/90 border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/60 p-5 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Squad</span>
                  <span className="font-semibold text-slate-900">{selectedChat?.squad}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Channel</span>
                  <span className="font-semibold text-slate-900">
                    {selectedChat?.channel === "direct" ? "Direct" : "Team"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedChat?.presence === "online" ? "Online" : "Focus"}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="rounded-2xl border-slate-200 text-slate-700">
                  <Icon name="phone" size={16} />
                  Call
                </Button>
                <Button variant="secondary" size="sm" className="rounded-2xl border-slate-200 text-slate-700">
                  <Icon name="video" size={16} />
                  Meet
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Media</p>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                  View all
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {pinnedMedia.map((media) => (
                  <div key={media.id} className="rounded-2xl overflow-hidden border border-slate-100">
                    <img src={media.preview} alt={media.title} className="h-24 w-full object-cover" />
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-slate-900">
                        {media.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{media.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Files</p>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                  Organize
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Icon name="file" size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {file.size} · {file.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900">Executive priorities</p>
              <p className="text-xs text-slate-500">
                Technicians and leadership stay aligned with this workspace snapshot.
              </p>
              <Button className="w-full rounded-2xl bg-slate-900 text-white text-sm">
                Export sync notes
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

