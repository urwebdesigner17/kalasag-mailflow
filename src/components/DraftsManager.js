import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DraftsManager({ userToken }) {
  const [drafts, setDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/get-drafts', {
        token: userToken.access_token
      });
      setDrafts(res.data);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleSend = async () => {
    try {
      await axios.post('http://localhost:5000/api/update-draft', {
        token: userToken.access_token,
        draftId: editingDraft.id,
        to: editingDraft.to,
        subject: editingDraft.subject,
        body: editingDraft.body
      });

      await axios.post('http://localhost:5000/api/send-existing-draft', {
        token: userToken.access_token,
        draftId: editingDraft.id
      });

      alert("Draft updated and sent!");
      setEditingDraft(null);
      fetchDrafts();
    } catch (err) {
      alert("Error saving or sending draft");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this draft?")) {
      await axios.post('http://localhost:5000/api/delete-draft', {
        token: userToken.access_token,
        draftId: id
      });
      fetchDrafts();
    }
  };

  return (
    <div style={styles.managerContainer}>
      {editingDraft ? (
        /* --- PROFESSIONAL EDIT VIEW --- */
        <div style={styles.formContainer}>
          <h3 style={styles.header}>Edit & Send Draft</h3>

          <label style={styles.label}>To:</label>
          <input
            value={editingDraft.to}
            style={styles.input}
            onChange={(e) => setEditingDraft({ ...editingDraft, to: e.target.value })}
          />

          <label style={styles.label}>Subject:</label>
          <input
            value={editingDraft.subject}
            style={styles.input}
            onChange={(e) => setEditingDraft({ ...editingDraft, subject: e.target.value })}
          />

          <label style={styles.label}>Message:</label>
          <textarea
            value={editingDraft.body}
            style={styles.textarea}
            onChange={(e) => setEditingDraft({ ...editingDraft, body: e.target.value })}
          />

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSend} style={styles.sendBtn}>Send Now</button>
            <button onClick={() => setEditingDraft(null)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      ) : (
        /* --- PROFESSIONAL LIST VIEW --- */
        <div>
          <h2 style={styles.header}>Your Drafts Inbox</h2>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '1.2em', color: '#1a73e8', fontWeight: '500' }}>🔄 Refreshing your drafts...</p>
            </div>
          ) : (
            <>
              {drafts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#5f6368' }}>No drafts found in your account.</p>
              ) : (
                drafts.map((d) => (
                  <div key={d.id} style={styles.card}>
                    <div style={{ flex: 1 }}>
                      <strong style={styles.cardSubject}>{d.subject || "(No Subject)"}</strong>
                      <p style={styles.cardRecipient}>To: {d.to || "(No Recipient)"}</p>
                      <p style={styles.previewTextStyle}>
                        {d.body && d.body !== "No content found"
                          ? d.body.substring(0, 100) + "..."
                          : "No content available"}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => setEditingDraft(d)} style={styles.editBtn}>Open</button>
                      <button onClick={() => handleDelete(d.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- ALL STYLES DEFINED HERE ---
const styles = {
  managerContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif'
  },
  header: {
    color: '#202124',
    fontSize: '22px',
    marginBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '10px'
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    padding: '16px',
    marginBottom: '12px',
    borderRadius: '8px',
    textAlign: 'left',
    transition: 'box-shadow 0.2s',
  },
  cardSubject: {
    fontSize: '16px',
    color: '#202124',
    display: 'block',
    marginBottom: '4px'
  },
  cardRecipient: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0'
  },
  previewTextStyle: {
    color: '#70757a',
    fontSize: '13px',
    backgroundColor: '#f8f9fa',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '10px',
    borderLeft: '3px solid #1a73e8'
  },
  formContainer: {
    backgroundColor: '#fff',
    textAlign: 'left',
    border: '1px solid #dadce0',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5f6368',
    marginBottom: '5px',
    marginTop: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #dadce0',
    fontSize: '15px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    height: '180px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #dadce0',
    fontSize: '15px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  sendBtn: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '10px 24px',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  editBtn: {
    backgroundColor: '#f1f3f4',
    color: '#3c4043',
    border: '1px solid #dadce0',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  deleteBtn: {
    backgroundColor: '#fff',
    color: '#d93025',
    border: '1px solid #fce8e6',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelBtn: {
    backgroundColor: '#fff',
    color: '#5f6368',
    border: '1px solid #dadce0',
    padding: '10px 24px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default DraftsManager;