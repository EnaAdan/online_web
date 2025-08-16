import React, { useState } from "react";
import { TextField, Button, Paper, Stack, Typography, MenuItem } from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AddApartment() {
  const [form, setForm] = useState({
    name: "", location: "", price: "", status: "available", details: ""
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const save = async() => {
    if (!form.name || !form.location || !form.price) return alert("Fill required fields");
    setLoading(true);
    try {
      await addDoc(collection(db, "apartments"), {
        ...form,
        price: Number(form.price),
        createdAt: serverTimestamp(),
      });
      nav("/apartments");
    } finally { setLoading(false); }
  };

  const set = (k)=>(e)=>setForm(s=>({...s,[k]:e.target.value}));

  return (
    <Paper sx={{ maxWidth: 600, mx:"auto", p:3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Add Apartment</Typography>
        <TextField label="Name" value={form.name} onChange={set("name")} />
        <TextField label="Location" value={form.location} onChange={set("location")} />
        <TextField label="Price (USD)" type="number" value={form.price} onChange={set("price")} />
        <TextField label="Details" value={form.details} onChange={set("details")} multiline minRows={3} />
        <TextField select label="Status" value={form.status} onChange={set("status")}>
          {["available","occupied","maintenance"].map(x=><MenuItem key={x} value={x}>{x.toUpperCase()}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </Stack>
    </Paper>
  );
}
