import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, Grid, Typography, Card, CardContent, 
  Chip, IconButton, LinearProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, Fab,
  AppBar, Toolbar
} from "@mui/material";
import {
  PowerSettingsNew as PowerIcon,
  AcUnit as AcUnitIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Thermostat as TemperatureIcon,
  Air as FanIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AddAirConditionerForm from "./AcForm";

const ApiUrl = process.env.REACT_APP_API_URL;

const AllAirConditioner = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ApiUrl}/ac/get/allac`);
        setDevices(response.data.data);
      } catch (err) {
        setError("Error fetching devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Handle box click and navigate to the details page
  const handleDeviceClick = (device) => {
    navigate(`/ac/dashbord/device/controll/${device._id}`, { state: { device } });
  };

  const handleAddDevice = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading devices...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: 0,
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      color: "#334155"
    }}>
      <AppBar 
        position="static" 
        elevation={1}
        sx={{ 
          backgroundColor: "white", 
          color: "#334155",
          borderBottom: "1px solid #e2e8f0",
          mb: 4
        }}
      >
        <Toolbar>
          <AcUnitIcon sx={{ mr: 2, fontSize: 30, color: "#0ea5e9" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Air Conditioners
          </Typography>
          <Chip 
            icon={<DashboardIcon />}
            label={`${devices.length} Device${devices.length !== 1 ? 's' : ''}`} 
            variant="outlined" 
            sx={{ color: "#64748b", borderColor: "#e2e8f0", backgroundColor: "#f1f5f9" }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2, p: 2, backgroundColor: "#fee2e2", borderRadius: 2 }}>
            {error}
          </Typography>
        )}

        {devices.length === 0 ? (
          <Box sx={{ 
            textAlign: "center", 
            p: 6, 
            backgroundColor: "white", 
            borderRadius: 3,
            border: "2px dashed #e2e8f0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            maxWidth: 500,
            mx: "auto"
          }}>
            <AcUnitIcon sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#475569", mb: 2 }}>
              No air conditioners found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Get started by adding your first air conditioner
            </Typography>
            <Fab variant="extended" onClick={handleAddDevice} sx={{ backgroundColor: "#0ea5e9", color: "white" }}>
              <AddIcon sx={{ mr: 1 }} />
              Add Device
            </Fab>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {devices.map((device) => (
                <Grid item xs={12} sm={6} md={4} key={device._id}>
                  <Card
                    sx={{
                      height: 280,
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      backgroundColor: "white",
                      backgroundImage: device.power === "on" 
                        ? "linear-gradient(rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))" 
                        : "none",
                      border: device.power === "on" ? "1px solid #bae6fd" : "1px solid #e2e8f0",
                      boxShadow: device.power === "on" 
                        ? "0 0 15px rgba(14, 165, 233, 0.2)" 
                        : "0 4px 6px rgba(0, 0, 0, 0.05)",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: device.power === "on" 
                          ? "0 0 20px rgba(14, 165, 233, 0.3)" 
                          : "0 8px 15px rgba(0, 0, 0, 0.08)",
                      },
                    }}
                    onClick={() => handleDeviceClick(device)}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0f172a" }}>
                            {device.devicename}
                          </Typography>
                          {/* <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                            ID: {device.deviceID}
                          </Typography> */}
                        </Box>
                        
                        {/* <Chip
                          icon={<PowerIcon />}
                          label={device.power === "on" ? "ON" : "OFF"}
                          size="small"
                          color={device.power === "on" ? "success" : "default"}
                          variant={device.power === "on" ? "filled" : "outlined"}
                          sx={{ 
                            fontWeight: "bold",
                            backgroundColor: device.power === "on" ? "#dcfce7" : "transparent",
                            color: device.power === "on" ? "#166534" : "#64748b",
                            borderColor: device.power === "on" ? "#bbf7d0" : "#e2e8f0"
                          }}
                        /> */}
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                        <Box
                          sx={{
                            position: "relative",
                            width: 80,
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: device.power === "on" ? "#e0f2fe" : "#f8fafc",
                            borderRadius: "50%",
                            border: device.power === "on" ? "2px solid #bae6fd" : "2px solid #e2e8f0"
                          }}
                        >
                          <AcUnitIcon
                            sx={{
                              fontSize: 40,
                              color: device.power === "on" ? "#0ea5e9" : "#cbd5e1",
                              animation: device.power === "on" ? "spin 3s infinite linear" : "none",
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" }
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}>
                        <Tooltip title="Temperature">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TemperatureIcon sx={{ fontSize: 18, color: "#64748b", mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: "#475569" }}>
                              {device.temperature || "24"}°C
                            </Typography>
                          </Box>
                        </Tooltip>
                        
                        <Tooltip title="Fan Speed">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FanIcon sx={{ fontSize: 18, color: "#64748b", mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: "#475569" }}>
                              {device.fanSpeed || "Auto"}
                            </Typography>
                          </Box>
                        </Tooltip>
                        
                        <Tooltip title="Humidity">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FanIcon sx={{ fontSize: 18, color: "#64748b", mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: "#475569" }}>
                              {device.humidity || "50"}%
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </CardContent>
                    
                    <Box 
                      sx={{ 
                        height: 4, 
                        backgroundColor: device.power === "on" ? "#0ea5e9" : "#e2e8f0",
                        width: device.power === "on" ? "100%" : "0%",
                        transition: "width 0.5s ease"
                      }} 
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddDevice}
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                backgroundColor: "#0ea5e9",
                color: "white",
                "&:hover": { backgroundColor: "#0284c7" }
              }}
            >
              {/* <AddIcon /> */}
            </Fab>
          </>
        )}

        {/* <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: "#f1f5f9", color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
            Add New Air Conditioner
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "white", p: 3 }}>
            <AddAirConditionerForm onClose={handleDialogClose} />
          </DialogContent>
        </Dialog> */}
        <AddAirConditionerForm/>
      </Box>
    </Box>
  );
};

export default AllAirConditioner;