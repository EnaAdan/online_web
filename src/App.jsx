import React, { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ApartmentsList from "./pages/ApartmentsList.jsx";
import AddApartment from "./pages/AddApartment.jsx";
import EditApartment from "./pages/EditApartment.jsx";
import IdentificationApproval from "./pages/IdentificationApproval.jsx";
import VisitorsApproval from "./pages/VisitorsApproval.jsx";
import MaterialApproval from "./pages/MaterialApproval.jsx";
import PostNotice from "./pages/PostNotice.jsx";
import RentalReport from "./pages/RentalReport.jsx";
import RequireAdmin from "./auth/RequireAdmin.jsx";
import { ToastContext } from "./contexts/ToastContext.jsx";
import { AppBar, Toolbar, Typography, Button, Container, Snackbar, Alert } from "@mui/material";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";



export default function App() {
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">Apartment Admin</Typography>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" onClick={() => signOut(auth)}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAdmin />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apartments" element={<ApartmentsList />} />
            <Route path="/apartments/add" element={<AddApartment />} />
            <Route path="/apartments/:id/edit" element={<EditApartment />} />
            <Route path="/approvals/identifications" element={<IdentificationApproval />} />
            <Route path="/approvals/visitors" element={<VisitorsApproval />} />
            <Route path="/approvals/materials" element={<MaterialApproval />} />
            <Route path="/notice" element={<PostNotice />} />
            <Route path="/reports/rentals" element={<RentalReport />} />
          </Route>

          <Route path="*" element={<Typography>Not Found</Typography>} />
        </Routes>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
