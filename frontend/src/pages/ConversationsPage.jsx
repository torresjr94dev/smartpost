import React, { useEffect, useState, useCallback } from 'react'
import ConversationList from '../components/ConversationList'
import ChatView from '../components/ChatView'
import StatsBar from '../components/StatsBar'
import { fetchConversations, fetchMessages, fetchStats, logout } from '../utils/api'
import { toast } from '../utils/toast'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [selected,      setSelected]      = useState(null)
  const [messages,      setMessages]      = useState([])
  const [stats,         setStats]         = useState(null)
  const [loadingConvs,  setLoadingConvs]  = useState(true)
  const [loadingMsgs,   setLoadingMsgs]   = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [convs, st] = await Promise.all([fetchConversations(), fetchStats()])
      setConversations(convs)
      setStats(st)
    } catch (e) {
      if (e.message === '401') { logout(); window.location.reload(); return }
      toast.error('Error cargando conversaciones')
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleSelect(conv) {
    setSelected(conv)
    setLoadingMsgs(true)
    try {
      const msgs = await fetchMessages(conv.id)
      setMessages(msgs)
      toast.info(`${msgs.length} mensajes cargados`)
    } catch (e) {
      if (e.message === '401') { logout(); window.location.reload(); return }
      toast.error('Error cargando mensajes')
    } finally {
      setLoadingMsgs(false)
    }
  }

  return (
    <div style={styles.page}>
      <StatsBar stats={stats} />
      <div style={styles.body}>
        <ConversationList
          conversations={conversations}
          selectedId={selected?.id}
          onSelect={handleSelect}
          loading={loadingConvs}
        />
        <ChatView
          conversation={selected}
          messages={messages}
          loading={loadingMsgs}
        />
      </div>
    </div>
  )
}

const styles = {
  page: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
}
