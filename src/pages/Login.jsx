import React, { useState } from "react";
import { TextField, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast.js";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123"; // sida Flutter-ka looga gudbayo

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { showToast } = useToast();

  const doLogin = async () => {
    setErr("");
    setLoading(true);
    
    try {
      // Check if credentials match admin constants
      if (email.trim() === ADMIN_EMAIL && pass.trim() === ADMIN_PASSWORD) {
        // Set session storage to mark user as logged in
        sessionStorage.setItem("adminLoggedIn", "true");
        // Show success toast and redirect to dashboard
        showToast("Login successful! Welcome to Admin Dashboard", "success");
        setTimeout(() => {
          nav("/dashboard", { replace: true });
          setLoading(false);
        }, 1000); // Small delay to show toast before redirect
        return;
      }
      
      // Check if user entered something but it's not the correct admin credentials
      if (email.trim() !== "" && pass.trim() !== "") {
        setErr("Invalid email or password");
        return;
      }
      
      // If fields are empty
      if (email.trim() === "" || pass.trim() === "") {
        setErr("Please enter email and password");
        return;
      }
      
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
