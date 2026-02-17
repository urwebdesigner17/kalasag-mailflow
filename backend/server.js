require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://kalasag-mailflow.onrender.com/'],
  methods: ['GET', 'POST'],
  credentials: true
}));

//SENDING MESAGE
app.post('/api/send-email', async (req, res) => {
  const { to, subject, message, token } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  // Create the RFC 2822 email string
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    message,
  ];
  const rawMessage = messageParts.join('\n');

  // Encode to Base64URL
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    res.status(200).send('Sent');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//FETCHING DRAFTS
app.post('/api/get-drafts', async (req, res) => {
  const { token } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const listRes = await gmail.users.drafts.list({ userId: 'me' });
    const drafts = listRes.data.drafts || [];

    const draftDetails = await Promise.all(
      drafts.map(async (d) => {
        const detail = await gmail.users.drafts.get({ userId: 'me', id: d.id });
        const payload = detail.data.message.payload;
        const headers = payload.headers;

        // ROBUST BODY EXTRACTOR
        const extractBody = (part) => {
          let body = "";
          if (part.body && part.body.data) {
            // Found it! Decode the Base64
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.parts) {
            // If it's multipart, look deeper into each part
            part.parts.forEach(p => {
              body += extractBody(p);
            });
          }
          return body;
        };

        const fullBody = extractBody(payload);

        return {
          id: d.id,
          subject: headers.find(h => h.name === 'Subject')?.value || '(No Subject)',
          to: headers.find(h => h.name === 'To')?.value || '(No Recipient)',
          body: fullBody || "No content found", // Fallback text
          snippet: detail.data.message.snippet
        };
      })
    );

    res.json(draftDetails);
  } catch (err) {
    console.error("Gmail Fetch Error:", err);
    res.status(500).send(err.message);
  }
});

//SENDING EXISTING DRAFT
app.post('/api/send-existing-draft', async (req, res) => {
  const { token, draftId } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // Gmail API has a specific method to send a draft by its ID
    await gmail.users.drafts.send({
      userId: 'me',
      requestBody: { id: draftId }
    });
    res.json({ message: "Draft Sent!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//UPDATE DRAFT
app.post('/api/update-draft', async (req, res) => {
  const { token, draftId, to, subject, body } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  // Re-encode the updated content into RFC 2822 format
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ];
  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.drafts.update({
      userId: 'me',
      id: draftId,
      requestBody: {
        message: {
          raw: encodedMessage
        }
      }
    });
    res.json({ message: "Draft updated successfully!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//DELETING DRAFTS
app.post('/api/delete-draft', async (req, res) => {
  const { token, draftId } = req.body;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.drafts.delete({
      userId: 'me',
      id: draftId,
    });
    res.status(200).json({ message: 'Draft deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete draft");
  }
});

//FOR GMAIL READONLY
//Getting all email
app.post('/api/get-emails', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).send("Token is required");

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'label:INBOX'
    });

    const messages = listResponse.data.messages || [];

    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
          const headers = detail.data.payload.headers;

          // Safer way to find header values
          const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

          return {
            id: msg.id,
            subject: getHeader('Subject') || '(No Subject)',
            from: getHeader('From') || '(Unknown)',
            labelIds: detail.data.labelIds,
            date: getHeader('Date') || '',
            snippet: detail.data.snippet || ''
          };
        } catch (innerErr) {
          console.error(`Error fetching message ${msg.id}:`, innerErr);
          return null; // Skip failed individual messages
        }
      })
    );

    // Filter out any nulls from failed individual fetches
    res.json(emailDetails.filter(email => email !== null));
  } catch (err) {
    console.error("Gmail Inbox Error:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: "Failed to fetch inbox", details: err.message });
  }
});

//FOR GMAIL MODIFY
// Endpoint to Trash an Email
app.post('/api/delete-email', async (req, res) => {
  const { token, messageId } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.trash({ userId: 'me', id: messageId });
    res.json({ success: true });
  } catch (err) {
    // THIS LINE IS KEY: Look at your terminal/command prompt for this output
    console.error("GMAIL API ERROR:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to Archive an Email (Remove "INBOX" label)
app.post('/api/archive-email', async (req, res) => {
  const { token, messageId } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: { removeLabelIds: ['INBOX'] }
    });
    res.json({ success: true, message: 'Email Archived' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mark-unread', async (req, res) => {
  const { token, messageId, isUnread } = req.body;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds: isUnread ? ['UNREAD'] : [],
        removeLabelIds: isUnread ? [] : ['UNREAD'],
      }
    });
    res.json({ success: true });
  } catch (err) {
    // Check your terminal for this log!
    console.error("GMAIL MODIFY ERROR:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend running on port ${PORT}'));
