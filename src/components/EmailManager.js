import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://your-backend-service-name.onrender.com';

function EmailManager({ userToken }) {
  const [emails, setEmails] = useState([]);

  const fetchEmails = async () => {
    const res = await axios.post(`${API_URL}/api/get-emails', {
      token: userToken.access_token
    });
    setEmails(res.data);
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleAction = async (endpoint, messageId) => {
    try {
      await axios.post(`http://localhost:5000/api/${endpoint}`, {
        token: userToken.access_token,
        messageId: messageId
      });
      // Refresh the list so the email "disappears"
      fetchEmails();
    } catch (err) { alert("Action failed!"); }
  };
  const toggleReadStatus = async (emailId, currentlyUnread) => {
    try {
      await await axios.post(`${API_URL}/api/mark-unread', {
        token: userToken.access_token,
        messageId: emailId,
        isUnread: !currentlyUnread // Flip the status
      });
      fetchEmails(); // Refresh the list
    } catch (err) {
      alert("Failed to change read status");
    }
  };

  return (
    <div style={styles.page}>
      <h2>Gmail Modify Dashboard</h2>
      <p>Manage your inbox using the <code>gmail.modify</code> scope.</p>

      <div style={styles.list}>
        {emails.map(email => (
          <div key={email.id} style={styles.row}>
            <div style={styles.info}>
              <strong>{email.from}</strong>
              <div>{email.subject}</div>
            </div>
            <div style={styles.actions}>
              <button onClick={() => handleAction('archive-email', email.id)} style={styles.archiveBtn}>Archive</button>
              <button onClick={() => handleAction('delete-email', email.id)} style={styles.deleteBtn}>Trash</button>
            </div>
          </div>
        ))}
      </div>
      {emails.map(email => {
        // Check if the UNREAD label exists in this email's labels
        const isUnread = email.labelIds?.includes('UNREAD');

        return (
          <div key={email.id} style={{...styles.row, opacity: isUnread ? 1 : 0.6}}>
            <div style={styles.info}>
              <span style={{ color: isUnread ? 'blue' : 'gray' }}>
                  {isUnread ? '● ' : '○ '}
              </span>
              <strong>{email.from}</strong>
              <div style={{ fontWeight: isUnread ? 'bold' : 'normal' }}>{email.subject}</div>
            </div>
            <div style={styles.actions}>
              <button onClick={() => toggleReadStatus(email.id, isUnread)}>
                {isUnread ? 'Mark as Read' : 'Mark as Unread'}
              </button>
              <button onClick={() => handleAction('archive-email', email.id)}>Archive</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  page: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #ddd', alignItems: 'center', backgroundColor: 'white' },
  info: { textAlign: 'left', flex: 1 },
  actions: { display: 'flex', gap: '10px' },
  archiveBtn: { backgroundColor: '#fbbc05', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#ea4335', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }
};

export default EmailManager;
