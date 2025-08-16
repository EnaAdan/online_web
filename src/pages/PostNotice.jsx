import React, { useState } from "react";
import { TextField, Button, Paper, Stack, Typography } from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function PostNotice() {
  const [title, setTitle] = useState("");
  const [message, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async() => {
    if (!title.trim() || !message.trim()) return alert("Fill both fields");
    setLoading(true);
    try {
      await addDoc(collection(db, "admin_notices"), {
        title, message, timestamp: serverTimestamp()
      });
      setTitle(""); setMsg("");
      alert("Notice posted");
    } finally { setLoading(false); }
  };

  return (
    <Paper sx={{ maxWidth: 700, mx:"auto", p:3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Admin Notice</Typography>
        <TextField label="Notice Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <TextField label="Notice Message" multiline minRows={4} value={message} onChange={e=>setMsg(e.target.value)} />
        <Button variant="contained" onClick={submit} disabled={loading}>{loading?"Posting...":"Post Notice"}</Button>
      </Stack>
    </Paper>
  );
}
