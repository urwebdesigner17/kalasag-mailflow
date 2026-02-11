import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InboxViewer({ userToken, onReply }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:5000/api/get-emails', {
          token: userToken.access_token
        });
        setEmails(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEmails();
  }, [userToken]);

  if (selectedEmail) {
    return (
      <div style={styles.viewContainer}>
        <button onClick={() => setSelectedEmail(null)} style={styles.backBtn}>← Back to Inbox</button>
        <div style={styles.emailDetail}>
          <h2 style={{ margin: '10px 0' }}>{selectedEmail.subject}</h2>
          <p><strong>From:</strong> {selectedEmail.from}</p>
          <hr />
          <p style={styles.fullBody}>{selectedEmail.snippet}...</p>
          {/* Note: In a real app, you'd fetch the full body here, but snippet works for demo! */}

          <button
            style={styles.replyBtn}
            onClick={() => onReply(selectedEmail)}
          >
            Reply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Inbox</h2>
      {loading ? <p>Loading...</p> : (
        <div style={styles.list}>
          {emails.map(email => (
            <div key={email.id} style={styles.emailRow} onClick={() => setSelectedEmail(email)}>
              <div style={styles.sender}>{email.from.split('<')[0]}</div>
              <div style={styles.content}>
                <strong>{email.subject}</strong> - {email.snippet}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
  viewContainer: { maxWidth: '800px', margin: '20px auto', textAlign: 'left', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  emailRow: { display: 'flex', padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' },
  sender: { width: '180px', fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' },
  content: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  backBtn: { background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' },
  replyBtn: { backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' },
  fullBody: { lineHeight: '1.6', color: '#3c4043', whiteSpace: 'pre-wrap' }
};

export default InboxViewer;