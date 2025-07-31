import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Button, 
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DataGrid } from '@mui/x-data-grid';
const ApiUrl = process.env.REACT_APP_API_URL;

const EnergyMeterReport1 = () => {
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [energyData, setEnergyData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch available meters on component mount
  useEffect(() => {
    const fetchMeters = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ApiUrl}/energy/meters`);
        const data = await response.json();
        setMeters(data);
        if (data.length > 0) {
          setSelectedMeterId(data[0]._id); // Now using _id instead of entityId
        }
      } catch (err) {
        setError('Failed to fetch energy meters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMeterId || !startDate || !endDate) {
      setError('Please select a meter and date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Format dates to ISO string using dayjs
      const start = startDate.startOf('day').toISOString();
      const end = endDate.endOf('day').toISOString();
      
      const response = await fetch(
        `${ApiUrl}/energy/energy-daily-history/?entityId=${selectedMeterId}&startDate=${start}&endDate=${end}`
      );
      const data = await response.json();
      setEnergyData(data);
    } catch (err) {
      setError('Failed to fetch energy data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    { 
      field: 'timestamp', 
      headerName: 'Date', 
      width: 200,
      valueGetter: (params) => dayjs(params.row.timestamp).format('MMM D, YYYY')
    },
    { 
      field: 'totalValue', 
      headerName: 'Consumption (Wh)', 
      width: 200,
      valueGetter: (params) => params.row.totalValue.toLocaleString()
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Energy Consumption Report
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Choose Room
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="meter-select-label">Energy Meter</InputLabel>
          <Select
            labelId="meter-select-label"
            value={selectedMeterId}
            label="Energy Meter"
            onChange={(e) => setSelectedMeterId(e.target.value)}
            disabled={loading}
          >
            {meters.map((meter) => (
              <MenuItem key={meter._id} value={meter._id}>  {/* Using _id as value */}
                {meter.deviceName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                disabled={loading}
                maxDate={endDate}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                disabled={loading}
                minDate={startDate}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !selectedMeterId || !startDate || !endDate}
          sx={{ mt: 1 }}
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      
      {energyData && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Consumption Summary
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'white' }}>
                <Typography variant="subtitle1">Total Consumption</Typography>
                <Typography variant="h4">
                  {energyData.summary.total.toLocaleString()} Wh
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, backgroundColor: 'secondary.light', color: 'white' }}>
                <Typography variant="subtitle1">Average Daily Consumption</Typography>
                <Typography variant="h4">
                  {Math.round(energyData.summary.average).toLocaleString()} Wh
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Daily Consumption Data
          </Typography>
          
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={energyData.data}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              getRowId={(row) => row._id}
              loading={loading}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'grey.100',
                  fontWeight: 'bold',
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default EnergyMeterReport1;