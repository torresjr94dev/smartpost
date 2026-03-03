import React, { useState } from 'react'
import { Toaster } from 'sileo'
import Sidebar from './components/Sidebar'
import ConversationsPage from './pages/ConversationsPage'
import ContactsPage from './pages/ContactsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BotChatsPage from './pages/BotChatsPage'
import LoginPage from './pages/LoginPage'
import { isAuthenticated, logout, getUser } from './utils/api'

export default function App() {
  const [authed, setAuthed]   = useState(isAuthenticated)
  const [section, setSection] = useState('conversations')

  function handleLogout() {
    logout()
    setAuthed(false)
  }

  if (!authed) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage onLogin={() => setAuthed(true)} />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div style={styles.app}>
        <Sidebar
          activeSection={section}
          onNavigate={setSection}
          user={getUser()}
          onLogout={handleLogout}
        />
        <main style={styles.main}>
          {section === 'conversations' && <ConversationsPage />}
          {section === 'contacts'      && <ContactsPage />}
          {section === 'analytics'     && <AnalyticsPage />}
          {section === 'bot'           && <BotChatsPage />}
        </main>
      </div>
    </>
  )
}

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    background: '#07090f',
    fontFamily: 'Inter, sans-serif',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
}
