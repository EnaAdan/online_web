import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, IconButton, Grid, Stack, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "../components/Loader.jsx";

export default function ApartmentsList() {
  const [items, setItems] = useState(null);
  const nav = useNavigate();

  useEffect(()=>{
    const q = query(collection(db, "apartments"), orderBy("name"));
    const unsub = onSnapshot(q, (snap)=>{
      setItems(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  },[]);

  const remove = async(id) => {
    if (!confirm("Delete apartment permanently?")) return;
    await deleteDoc(doc(db, "apartments", id));
  };

  if (!items) return <Loader />;

  if (!items.length) return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography>No apartments found</Typography>
      <Button variant="contained" onClick={()=>nav("/apartments/add")}>Add New</Button>
    </Stack>
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Apartments</Typography>
        <Button variant="contained" onClick={()=>nav("/apartments/add")}>Add</Button>
      </Stack>
      <Grid container spacing={2}>
        {items.map(apt=>(
          <Grid item xs={12} md={6} key={apt.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="h6">{apt.name || "No Name"}</Typography>
                    <Typography variant="body2">Location: {apt.location}</Typography>
                    <Typography variant="body2">Price: ${Number(apt.price||0).toFixed(2)}</Typography>
                    <Typography variant="body2">Status: {apt.status||"-"}</Typography>
                  </div>
                  <div>
                    <IconButton onClick={()=>nav(`/apartments/${apt.id}/edit`)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={()=>remove(apt.id)}><DeleteIcon /></IconButton>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
