import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, Typography, Grid, Stack, Button } from "@mui/material";
import Loader from "../components/Loader.jsx";
import { format } from "date-fns";

export default function MaterialApproval() {
  const [items, setItems] = useState(null);

  useEffect(()=>{
    const q = query(collection(db,"material_requests"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, (snap)=>{
      setItems(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  const setStatus = async(id, status)=>updateDoc(doc(db,"material_requests", id), { status });

  if (!items) return <Loader />;

  return (
    <Grid container spacing={2}>
      {items.map(x=>{
        const ts = x.createdAt?.toDate?.() || null;
        const date = ts ? format(ts, "MMM d, yyyy HH:mm") : "Unknown";
        return (
          <Grid key={x.id} item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">{x.name || "No Name"}</Typography>
                  <Typography>{x.description || ""}</Typography>
                  <Typography variant="caption">{date}</Typography>
                  <Typography>Status: {(x.status||"pending")}</Typography>
                  {(x.status||"pending")==="pending" && (
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button variant="contained" color="success" onClick={()=>setStatus(x.id,"approved")}>Approve</Button>
                      <Button variant="contained" color="error" onClick={()=>setStatus(x.id,"rejected")}>Reject</Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
