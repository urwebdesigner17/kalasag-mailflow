import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ComposeEmail({ userToken, prefill }) {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // This hook updates the form whenever the 'prefill' prop changes
  useEffect(() => {
    if (prefill) {
      setEmailData({
        to: prefill.to,
        subject: prefill.subject,
        message: prefill.message
      });
    } else {
      // Clear form if it's a fresh compose
      setEmailData({ to: '', subject: '', message: '' });
    }
  }, [prefill]);

  const sendEmail = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-email', {
        ...emailData,
        token: userToken.access_token
      });
      alert('Email Sent Successfully! 🚀');
      setEmailData({ to: '', subject: '', message: '' }); // Reset after send
    } catch (error) {
      console.error(error);
      alert('Failed to send email.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{prefill ? "Reply to Message" : "New Message"}</h2>

      <div style={styles.group}>
        <label style={styles.label}>Recipient</label>
        <input
          style={styles.input}
          value={emailData.to}
          onChange={e => setEmailData({...emailData, to: e.target.value})}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Subject</label>
        <input
          style={styles.input}
          value={emailData.subject}
          onChange={e => setEmailData({...emailData, subject: e.target.value})}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Message Body</label>
        <textarea
          style={styles.textarea}
          value={emailData.message}
          onChange={e => setEmailData({...emailData, message: e.target.value})}
        />
      </div>

      <button style={styles.sendButton} onClick={sendEmail}>
        {prefill ? "Send Reply" : "Send Email"}
      </button>
    </div>
  );
}

// Use the same styles we created earlier...
const styles = {
  container: { maxWidth: '600px', margin: '20px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'left' },
  header: { marginBottom: '20px', color: '#1a73e8' },
  group: { marginBottom: '15px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '5px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' },
  textarea: { width: '100%', height: '150px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' },
  sendButton: { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ComposeEmail;