import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Paper, 
  Stack, 
  TextField, 
  Button, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  TableContainer
} from "@mui/material";
import {
  Assessment as ReportIcon,
  DateRange as DateIcon,
  PictureAsPdf as PdfIcon,
  Clear as ClearIcon,
  Home as HomeIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "../hooks/useToast";

export default function RentalReport() {
  const [docs, setDocs] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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

  const exportPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const today = format(new Date(), "dd/MM/yyyy");
      
      // Header
      doc.setFontSize(20);
      doc.text("Rental Report", 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${today}`, 14, 30);
      doc.text(`Total Records: ${filtered.length}`, 14, 38);
      
      if (start || end) {
        const dateRange = `Period: ${start || 'All'} to ${end || 'All'}`;
        doc.text(dateRange, 14, 46);
      }

      const rows = filtered.map(x => {
        try {
          return [
            x.apartmentName || "-",
            (Number(x.paymentAmount||0)).toFixed(2),
            String(x.days || 0),
            (Number(x.totalPrice||0)).toFixed(2),
            x.startDate?.toDate ? format(x.startDate.toDate(),"dd/MM/yyyy") : "-",
            x.endDate?.toDate ? format(x.endDate.toDate(),"dd/MM/yyyy") : "-",
          ];
        } catch {
          return [
            x.apartmentName || "-",
            "0.00",
            "0",
            "0.00",
            "-",
            "-"
          ];
        }
      });

      // Calculate totals
      const totalRevenue = filtered.reduce((sum, x) => {
        try {
          return sum + (Number(x.totalPrice||0));
        } catch {
          return sum;
        }
      }, 0);
      
      autoTable(doc, {
        startY: start || end ? 54 : 46,
        head: [["Apartment","Rent/Day","Days","Total","Start Date","End Date"]],
        body: rows,
        foot: [["", "", "Total:", totalRevenue.toFixed(2), "", ""]],
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] },
        footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      const filename = `rental-report-${today.replace(/\//g, '-')}.pdf`;
      doc.save(filename);
      showToast("PDF report exported successfully!", "success");
    } catch (error) {
      console.error("PDF Export Error:", error);
      showToast("Failed to export PDF report. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = useMemo(() => {
    return filtered.reduce((sum, x) => sum + (Number(x.totalPrice||0)), 0);
  }, [filtered]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rental Reports
        </Typography>
        <Typography color="text.secondary">
          Generate and export rental income reports
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <ReportIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Filter Reports</Typography>
              <Typography variant="body2" color="text.secondary">
                Select date range to filter rental data
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField 
              label="Start Date" 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              value={start} 
              onChange={e => setStart(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField 
              label="End Date" 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              value={end} 
              onChange={e => setEnd(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <Button 
              variant="outlined" 
              startIcon={<ClearIcon />}
              onClick={() => { setStart(""); setEnd(""); }}
            >
              Clear
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PdfIcon />}
              onClick={exportPDF}
              disabled={loading}
              size="large"
            >
              {loading ? "Exporting..." : "Export PDF"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {filtered.length}
            </Typography>
            <Typography color="text.secondary">Total Records</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              ${totalRevenue.toFixed(2)}
            </Typography>
            <Typography color="text.secondary">Total Revenue</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Data Table */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <HomeIcon color="action" />
            <Typography variant="h6">Rental Data</Typography>
            <Chip label={`${filtered.length} records`} size="small" />
          </Stack>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Apartment</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rent/Day</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Days</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No rental data found for the selected period
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.apartmentName || "-"}</TableCell>
                      <TableCell align="right">${Number(r.paymentAmount||0).toFixed(2)}</TableCell>
                      <TableCell align="right">{r.days||0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                        ${Number(r.totalPrice||0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {r.startDate?.toDate ? format(r.startDate.toDate(),"MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {r.endDate?.toDate ? format(r.endDate.toDate(),"MMM d, yyyy") : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
