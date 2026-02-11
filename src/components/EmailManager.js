import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = window.location.hostname === 'localhost'
? 'http://localhost:5000'
: '';

function EmailManager({ userToken }) {
const [emails, setEmails] = useState([]);

const fetchEmails = async () => {
try {
const res = await axios.post(${API_URL}/api/get-emails, {
token: userToken.access_token
});
setEmails(res.data);
} catch (err) {
console.error("Fetch error:", err);
}
};

useEffect(() => {
fetchEmails();
}, []);

const handleAction = async (endpoint, messageId) => {
try {
await axios.post(${API_URL}/api/${endpoint}, {
token: userToken.access_token,
messageId: messageId
});
fetchEmails();
} catch (err) {
alert("Action failed!");
}
};

const toggleReadStatus = async (emailId, currentlyUnread) => {
try {
await axios.post(${API_URL}/api/mark-unread, {
token: userToken.access_token,
messageId: emailId,
isUnread: !currentlyUnread
});
fetchEmails();
} catch (err) {
alert("Failed to change read status");
}
};

return (
<div style={styles.page}>
<h2 style={styles.title}>KALASAG-MailFlow Dashboard</h2>
<p style={styles.subtitle}>Manage your inbox using the gmail.modify scope.</p>

);
}

const styles = {
page: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto' },
title: { color: '#1a73e8' },
subtitle: { color: '#5f6368', marginBottom: '30px' },
list: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
row: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' },
info: { textAlign: 'left', flex: 1 },
actions: { display: 'flex', gap: '8px' },
statusBtn: { cursor: 'pointer', padding: '6px' },
archiveBtn: { backgroundColor: '#fbbc05', border: 'none', padding: '6px', cursor: 'pointer' },
deleteBtn: { backgroundColor: '#ea4335', color: 'white', border: 'none', padding: '6px', cursor: 'pointer' }
};

export default EmailManager;