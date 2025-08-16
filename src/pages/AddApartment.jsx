import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  MenuItem, 
  Grid,
  Box,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  Chip
} from "@mui/material";
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon
} from "@mui/icons-material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast.js";

export default function AddApartment() {
  const [form, setForm] = useState({
    name: "", location: "", price: "", status: "available", details: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Apartment name is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.price || Number(form.price) <= 0) newErrors.price = "Valid price is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async() => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "apartments"), {
        ...form,
        price: Number(form.price),
        createdAt: serverTimestamp(),
      });
      showToast("Apartment added successfully!", "success");
      nav("/apartments");
    } catch {
      showToast("Failed to add apartment", "error");
    } finally { 
      setLoading(false); 
    }
  };

  const set = (k) => (e) => {
    setForm(s => ({...s, [k]: e.target.value}));
    if (errors[k]) {
      setErrors(prev => ({...prev, [k]: ""}));
    }
  };

  const statusOptions = [
    { value: "available", label: "Available", color: "success" },
    { value: "occupied", label: "Occupied", color: "error" },
    { value: "maintenance", label: "Maintenance", color: "warning" }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => nav("/apartments")}
          color="inherit"
        >
          Back to Apartments
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Add New Apartment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details to add a new apartment to your listings
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Form Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <TextField
                  label="Apartment Name"
                  value={form.name}
                  onChange={set("name")}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="e.g., Sunset View Apartment 2A"
                />

                <TextField
                  label="Location"
                  value={form.location}
                  onChange={set("location")}
                  error={!!errors.location}
                  helperText={errors.location}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="e.g., 123 Main Street, Downtown"
                />

                <TextField
                  label="Monthly Rent"
                  type="number"
                  value={form.price}
                  onChange={set("price")}
                  error={!!errors.price}
                  helperText={errors.price || "Enter monthly rent amount"}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="1200"
                />

                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={set("status")}
                  fullWidth
                  helperText="Current availability status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          size="small"
                          label={option.label}
                          color={option.color}
                        />
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Additional Details"
                  value={form.details}
                  onChange={set("details")}
                  multiline
                  minRows={4}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <InfoIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Describe amenities, features, or special notes about this apartment..."
                  helperText="Optional: Add any additional information about the apartment"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {form.name || "Apartment name"}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {form.location || "Location"}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monthly Rent
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ${Number(form.price || 0).toLocaleString()}/month
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    color={statusOptions.find(s => s.value === form.status)?.color || "default"}
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => nav("/apartments")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={save}
          disabled={loading}
          size="large"
        >
          {loading ? "Saving..." : "Save Apartment"}
        </Button>
      </Stack>
    </Box>
  );
}
