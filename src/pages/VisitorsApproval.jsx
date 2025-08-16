import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, Typography, Grid, Stack, Button } from "@mui/material";
import Loader from "../components/Loader.jsx";
import StatusChip from "../components/StatusChip.jsx";

export default function VisitorsApproval() {
  const [items, setItems] = useState(null);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"visitors"), (snap)=>{
      setItems(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  const setStatus = (id, status)=>updateDoc(doc(db,"visitors", id), { status });
  const remove = (id)=>{ if(confirm("Delete?")) deleteDoc(doc(db,"visitors", id)); };

  if (!items) return <Loader />;

  return (
    <Grid container spacing={2}>
      {items.map(v=>(
        <Grid key={v.id} item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">{v.visitor_name || "Unknown Visitor"}</Typography>
                <Typography>Apartment: {v.apartment_name || "-"}</Typography>
                <Typography>Visit Reason: {v.visit_reason || "-"}</Typography>
                <Typography>Check-In: {v.check_in || "-"} | Check-Out: {v.check_out || "-"}</Typography>
                <StatusChip status={v.status} />
                {(String(v.status||"").toLowerCase()==="pending") && (
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button variant="contained" color="success" onClick={()=>setStatus(v.id,"approved")}>Approve</Button>
                    <Button variant="contained" color="error" onClick={()=>setStatus(v.id,"rejected")}>Reject</Button>
                    <Button onClick={()=>remove(v.id)}>Delete</Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
