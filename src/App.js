import React, { useState } from 'react';
import Login from './components/login';
import ComposeEmail from './components/ComposeEmail';
import DraftsManager from './components/DraftsManager';
import InboxViewer from './components/InboxViewer';
import EmailManager from './components/EmailManager';

function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('inbox'); // 'compose' or 'drafts'
  const [replyData, setReplyData] = useState(null);

  //functions that handle reply to the selected email
  const handleReply = (email) => {
    // Extract email address between < > or just take the whole string
    const emailMatch = email.from.match(/<(.+)>|(\S+@\S+)/);
    const targetEmail = emailMatch ? (emailMatch[1] || emailMatch[2]) : email.from;

    setReplyData({
      to: targetEmail,
      subject: `Re: ${email.subject}`,
      message: `\n\n--- On ${email.date}, ${email.from} wrote: ---\n> ${email.snippet}`
    });
    setView('compose'); // Switch view automatically
  };

  // ... In your return block ...
  {view === 'inbox' && <InboxViewer userToken={token} onReply={handleReply} />}
  {view === 'compose' && <ComposeEmail userToken={token} prefill={replyData} />}

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* --- PROFESSIONAL NAVIGATION BAR --- */}
      <nav style={navStyles.header}>
        <div style={navStyles.brand}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>✉️</span>
          <span style={navStyles.logoText}>KALASAG-MailFlow</span>
        </div>

        <div style={navStyles.navGroup}>
          <button style={navStyles.navLink(view === 'inbox')} onClick={() => setView('inbox')}>
            Inbox
          </button>
          <button
            style={navStyles.navLink(view === 'compose')}
            onClick={() => setView('compose')}
          >
            Compose
          </button>
          <button
            style={navStyles.navLink(view === 'drafts')}
            onClick={() => setView('drafts')}
          >
            Manage Drafts
          </button>
          <button
            style={navStyles.navLink(view === 'manager')}
            onClick={() => setView('manager')}
          >
            Manage Emails
          </button>
        </div>

        <button style={navStyles.logoutBtn} onClick={() => setToken(null)}>
          Logout
        </button>
      </nav>

      {/* --- DYNAMIC CONTENT AREA --- */}
      <div style={{ padding: '20px' }}>
        {view === 'compose' && <ComposeEmail userToken={token} />}
        {view === 'drafts' && <DraftsManager userToken={token} />}
        {view === 'inbox' && <InboxViewer userToken={token} onReply={handleReply} />}
        {view === 'manager' && <EmailManager userToken={token} />}
      </div>
    </div>
  );
}

// --- NAVIGATION STYLES ---
const navStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dadce0',
    height: '64px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a73e8',
    letterSpacing: '-0.5px',
  },
  navGroup: {
    display: 'flex',
    gap: '30px',
    height: '100%',
  },
  navLink: (isActive) => ({
    padding: '0 10px',
    height: '64px',
    fontSize: '14px',
    fontWeight: '600',
    color: isActive ? '#1a73e8' : '#5f6368',
    border: 'none',
    backgroundColor: 'transparent',
    borderBottom: isActive ? '3px solid #1a73e8' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }),
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#d93025',
    border: '1px solid #d93025',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'background-color 0.2s',
  }
};

export default App;