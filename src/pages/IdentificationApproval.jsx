import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, Typography, Grid, Stack, Button } from "@mui/material";
import Loader from "../components/Loader.jsx";
import StatusChip from "../components/StatusChip.jsx";

export default function IdentificationApproval() {
  const [items, setItems] = useState(null);

  useEffect(()=>{
    const q = query(collection(db, "identifications"), orderBy("submittedAt","desc"));
    const unsub = onSnapshot(q, (snap)=>{
      setItems(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  const setStatus = async(id, status)=>{
    await updateDoc(doc(db,"identifications", id), { status });
  };

  if (!items) return <Loader />;

  return (
    <Grid container spacing={2}>
      {items.map(x=>(
        <Grid item xs={12} md={6} key={x.id}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Apartment: {x.apartmentName}</Typography>
                <Typography>Responsible: {x.responsibleName}</Typography>
                <Typography>ID Number: {x.responsibleIdNumber}</Typography>
                <Typography>Phone: {x.responsiblePhone}</Typography>
                <Typography>Workplace: {x.responsibleWorkPlace}</Typography>
                <StatusChip status={x.status} />
                <Stack direction="row" spacing={1} mt={1}>
                  <Button variant="contained" color="success" onClick={()=>setStatus(x.id,"Approved")}>Approve</Button>
                  <Button variant="contained" color="error" onClick={()=>setStatus(x.id,"Rejected")}>Reject</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
