import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Visibility, Search } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";

const DeviceManager = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // fields to edit (from Device.model)
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState("switch");
  const [status, setStatus] = useState("offline");
  const [isActive, setIsActive] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch devices
  useEffect(() => {
    axios
      .get(`${API_URL}/device/getall`)
      .then((res) => setDevices(res.data.data))
      .catch(console.error);
  }, []);

  const handleEditClick = (device) => {
    setSelectedDevice(device);
    setName(device.name || "");
    setDeviceId(device.deviceId || "");
    setDeviceType(device.deviceType || "switch");
    setStatus(device.status || "offline");
    setIsActive(Boolean(device.isActive));
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    const payload = { name, deviceId, deviceType, status, isActive };
    axios
      .put(`${API_URL}/device/edit/${selectedDevice._id}`, payload)
      .then((res) => {
        const updated = res.data?.data || payload;
        setDevices((devices) =>
          devices.map((d) => (d._id === selectedDevice._id ? { ...d, ...updated } : d))
        );
        setEditModalOpen(false);
      })
      .catch(console.error);
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id); // Set the device ID to delete
    setDeleteModalOpen(true); // Open the delete confirmation dialog
  };

  const handleDeleteConfirm = () => {
    axios
      .delete(`${API_URL}/device/delete/${deviceToDelete}`)
      .then(() => {
        setDevices((prev) => prev.filter((d) => d._id !== deviceToDelete));
        setDeleteModalOpen(false); // Close the dialog
        setDeviceToDelete(null); // Clear the device ID
      })
      .catch(console.error);
  };

  // Filter devices based on search query
  const filteredDevices = devices.filter((device) => {
    const query = searchQuery.toLowerCase();
    return (
      device.name?.toLowerCase().includes(query) ||
      device.deviceId?.toLowerCase().includes(query) ||
      device.status?.toLowerCase().includes(query) ||
      (device.deviceType && device.deviceType.toLowerCase().includes(query))
    );
  });

  return (
    <Paper sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>
      
      {/* Search Filter */}
      <TextField
        fullWidth
        placeholder="Search devices by name, ID, status, or type..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device Name</TableCell>
              <TableCell>Device ID</TableCell>
              <TableCell>Device Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Is Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? "No devices found matching your search." : "No devices available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => (
              <TableRow key={device._id}>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.deviceId}</TableCell>
                <TableCell>{device.deviceType}</TableCell>
                <TableCell>
                  {device.status}
                </TableCell>
                <TableCell>
                  {device.isActive ? "Active" : "Inactive"}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(device)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteClick(device._id)}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/devices/${device._id}/entities`}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2, minWidth: 420 }}>
          <TextField
            label="Device Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Device ID"
            fullWidth
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            helperText="Must be unique"
          />
          <FormControl fullWidth>
            <InputLabel id="device-type-label">Device Type</InputLabel>
            <Select
              labelId="device-type-label"
              label="Device Type"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
            >
              <MenuItem value="switch">switch</MenuItem>
              <MenuItem value="sensor">sensor</MenuItem>
              <MenuItem value="meter">meter</MenuItem>
              <MenuItem value="motor">custom</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="online">online</MenuItem>
              <MenuItem value="offline">offline</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            }
            label="Is Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" startIcon={<Edit />}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this device?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DeviceManager;