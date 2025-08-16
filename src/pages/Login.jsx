import React, { useState } from "react";
import { TextField, Button, Paper, Stack, Typography } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123"; // sida Flutter-ka looga gudbayo

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const doLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      // Haddii la rabo bypass admin sida Flutter:
      if (email.trim() === ADMIN_EMAIL && pass.trim() === ADMIN_PASSWORD) {
        // samee anonymous sign-in ama isticmaal email/password kan oo hore u diiwaangashan
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
          .catch(()=>Promise.resolve()); // haddii aadan rabin auth dhab ah
        return nav("/dashboard", { replace: true });
      }
      // Haddii kale, auth caadi ah:
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 420, mx: "auto", p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Admin Login</Typography>
        <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <TextField label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <Typography color="error">{err}</Typography>}
        <Button variant="contained" onClick={doLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </Stack>
    </Paper>
  );
}
