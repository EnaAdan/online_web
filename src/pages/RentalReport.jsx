import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Paper, Stack, TextField, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RentalReport() {
  const [docs, setDocs] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"rentals"), (snap)=>{
      setDocs(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  const filtered = useMemo(()=>{
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    return docs.filter(d=>{
      const dt = d.startDate?.toDate?.() || null;
      if (!dt) return true;
      if (s && dt < s) return false;
      if (e && dt > e) return false;
      return true;
    });
  },[docs, start, end]);

  const exportPDF = ()=>{
    const doc = new jsPDF();
    const today = format(new Date(), "d/M/yyyy");
    doc.setFontSize(16);
    doc.text("Rental Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Date: ${today}`, 180, 18, { align: "right" });

    const rows = filtered.map(x=>[
      x.apartmentName || "-",
      (Number(x.paymentAmount||0)).toFixed(2),
      String(x.days || 0),
      (Number(x.totalPrice||0)).toFixed(2),
      x.startDate?.toDate ? format(x.startDate.toDate(),"d/M/yyyy") : "-",
      x.endDate?.toDate ? format(x.endDate.toDate(),"d/M/yyyy") : "-",
    ]);

    doc.autoTable({
      startY: 24,
      head: [["Apartment","Rent/Day","Days","Total","Start Date","End Date"]],
      body: rows
    });
    doc.save("rental-report.pdf");
  };

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction={{ xs:"column", sm:"row" }} spacing={2} alignItems="center" mb={2}>
        <TextField label="Start Date" type="date" InputLabelProps={{ shrink:true }} value={start} onChange={e=>setStart(e.target.value)} />
        <TextField label="End Date" type="date" InputLabelProps={{ shrink:true }} value={end} onChange={e=>setEnd(e.target.value)} />
        <Button variant="outlined" onClick={()=>{setStart(""); setEnd("");}}>Clear</Button>
        <Button variant="contained" onClick={exportPDF}>Export PDF</Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Apartment</TableCell>
            <TableCell align="right">Rent/Day</TableCell>
            <TableCell align="right">Days</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(r=>(
            <TableRow key={r.id}>
              <TableCell>{r.apartmentName || "-"}</TableCell>
              <TableCell align="right">{Number(r.paymentAmount||0).toFixed(2)}</TableCell>
              <TableCell align="right">{r.days||0}</TableCell>
              <TableCell align="right">{Number(r.totalPrice||0).toFixed(2)}</TableCell>
              <TableCell>{r.startDate?.toDate ? format(r.startDate.toDate(),"yyyy-MM-dd") : "-"}</TableCell>
              <TableCell>{r.endDate?.toDate ? format(r.endDate.toDate(),"yyyy-MM-dd") : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography sx={{ mt:2 }} variant="body2">Total Records: {filtered.length}</Typography>
    </Paper>
  );
}
