import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  InputAdornment
} from "@mui/material";
import {
  Announcement as AnnouncementIcon,
  Title as TitleIcon,
  Message as MessageIcon,
  Send as SendIcon
} from "@mui/icons-material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../hooks/useToast";

export default function PostNotice() {
  const [title, setTitle] = useState("");
  const [message, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const submit = async() => {
    if (!title.trim() || !message.trim()) {
      showToast("Please fill in both title and message fields", "error");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "admin_notices"), {
        title: title.trim(), 
        message: message.trim(), 
        timestamp: serverTimestamp(),
        postedBy: "Admin"
      });
      setTitle(""); 
      setMsg("");
      showToast("Notice posted successfully!", "success");
    } catch {
      showToast("Failed to post notice. Please try again.", "error");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Post Notice
        </Typography>
        <Typography color="text.secondary">
          Create and publish announcements for all residents
        </Typography>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Header with icon */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <AnnouncementIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2">
                  Admin Notice
                </Typography>
                <Typography color="text.secondary">
                  Fill in the details below to post a new notice
                </Typography>
              </Box>
            </Stack>

            {/* Form Fields */}
            <TextField 
              label="Notice Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Enter a clear, descriptive title"
              helperText="Keep the title concise and informative"
            />
            
            <TextField 
              label="Notice Message"
              value={message}
              onChange={e => setMsg(e.target.value)}
              multiline
              minRows={6}
              maxRows={12}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                    <MessageIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Write your message here. Be clear and provide all necessary details..."
              helperText={`${message.length} characters`}
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => { setTitle(""); setMsg(""); }}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Clear Form
              </Button>
              <Button
                variant="contained"
                onClick={submit}
                disabled={loading || !title.trim() || !message.trim()}
                startIcon={<SendIcon />}
                sx={{ flex: 2 }}
                size="large"
              >
                {loading ? "Posting Notice..." : "Post Notice"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
