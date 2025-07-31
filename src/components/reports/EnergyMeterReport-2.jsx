import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Button, 
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EnergyMeterReport2 = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [meterData, setMeterData] = useState([]);
  const [error, setError] = useState(null);
const ApiUrl = process.env.REACT_APP_API_URL;
  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Please select a date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Format dates to ISO string using dayjs
      const start = startDate.startOf('day').toISOString();
      const end = endDate.endOf('day').toISOString();
      
      const response = await fetch(
        `${ApiUrl}/energy/energy-meters-with-date-range/?startDate=${start}&endDate=${end}`
      );
      const data = await response.json();
      setMeterData(data);
    } catch (err) {
      setError('Failed to fetch energy data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Energy Consumption Comparison Report
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Date Range
        </Typography>
        
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
          disabled={loading || !startDate || !endDate}
          sx={{ mt: 1 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      
      {meterData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Energy Consumption by Meter ({dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Entity Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Consumption (Wh)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meterData.map((meter, index) => (
                  <TableRow key={meter._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{meter.deviceName}</TableCell>
                    <TableCell>{meter.entityName}</TableCell>
                    <TableCell align="right">{meter.totalConsumption.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {meterData.reduce((sum, meter) => sum + meter.totalConsumption, 0).toLocaleString()} Wh
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default EnergyMeterReport2;