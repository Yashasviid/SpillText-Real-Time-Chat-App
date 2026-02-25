'use client'
import { Users, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface ChatHeaderProps { conversation: any }
const ONLINE_TIMEOUT = 30000 // 30s

export function ChatHeader({ conversation }: ChatHeaderProps) {
  if (!conversation) return null // No blank crash

  const router = useRouter()
  const isGroup = conversation.isGroup ?? false
  const otherUser = !isGroup ? conversation.otherUsers?.[0] : null
  const name = isGroup ? (conversation.groupName ?? 'Group') : (otherUser?.name ?? 'Unknown')
  const imageUrl = isGroup ? null : otherUser?.imageUrl
  const lastSeenRaw = !isGroup && typeof otherUser?.lastSeen === 'number' ? otherUser.lastSeen : null
  const isOnline = !isGroup && otherUser?.isOnline && lastSeenRaw && (Date.now() - lastSeenRaw < ONLINE_TIMEOUT)
  const statusText = isGroup 
    ? `${conversation.otherUsers?.length ?? 1} members`
    : isOnline ? 'Online' 
    : lastSeenRaw ? `Last seen ${formatDistanceToNow(lastSeenRaw, { addSuffix: true })}`
    : 'Offline'

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#111827]">
      <button onClick={() => router.push('/chat')} className="w-8 h-8 rounded-lg hover:bg-white/5 text-slate-400 flex items-center justify-center transition">
        <ArrowLeft size={16} />
      </button>
      <div className="relative flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3a0]/30 to-blue-500/30 flex items-center justify-center">
            {isGroup ? <Users size={16} className="text-[#22d3a0]" /> : <span className="text-white font-semibold">{name?.[0]?.toUpperCase()}</span>}
          </div>
        )}
        {!isGroup && (
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111827] ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>{name}</h2>
        <p className="text-xs text-slate-500">{statusText}</p>
      </div>
    </div>
  )
}
