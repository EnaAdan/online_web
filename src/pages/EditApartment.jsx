import React, { useEffect, useState } from "react";
import { TextField, Button, Paper, Stack, Typography, MenuItem } from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader.jsx";

export default function EditApartment() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  useEffect(()=>{
    (async()=>{
      const snap = await getDoc(doc(db,"apartments", id));
      setForm({ id, ...snap.data() });
    })();
  },[id]);

  const save = async() => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "apartments", id), {
        name: form.name,
        location: form.location,
        price: Number(form.price || 0),
        details: form.details || "",
        status: form.status || "available",
      });
      nav("/apartments");
    } finally { setSaving(false); }
  };

  if (!form) return <Loader />;

  const set = (k)=>(e)=>setForm(s=>({...s,[k]:e.target.value}));

  return (
    <Paper sx={{ maxWidth: 600, mx:"auto", p:3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Edit Apartment</Typography>
        <TextField label="Name" value={form.name||""} onChange={set("name")} />
        <TextField label="Location" value={form.location||""} onChange={set("location")} />
        <TextField label="Price (USD)" type="number" value={form.price||""} onChange={set("price")} />
        <TextField label="Details" value={form.details||""} onChange={set("details")} multiline minRows={3} />
        <TextField select label="Status" value={form.status||"available"} onChange={set("status")}>
          {["available","occupied","maintenance"].map(x=><MenuItem key={x} value={x}>{x.toUpperCase()}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={save} disabled={saving}>{saving?"Updating...":"Update"}</Button>
      </Stack>
    </Paper>
  );
}
