import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Line 5
// Line 6
// Line 7
// Line 8
// Line 9
// Line 10
// Line 11
// Line 12
const TEST_VAR = "Clean"; 
// Line 14
// Line 15

function EmailManager({ userToken }) {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const getMail = async () => {
      try {
        const url = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000/api/get-emails' 
          : 'https://your-backend.onrender.com/api/get-emails';

        const res = await axios.post(url, { token: userToken.access_token });
        setEmails(res.data);
      } catch (e) { console.log(e); }
    };
    if (userToken) getMail();
  }, [userToken]);

  return (
    <div>
      <h1>MailFlow</h1>
      {emails.map(m => <div key={m.id}>{m.subject}</div>)}
    </div>
  );
}

export default EmailManager;
