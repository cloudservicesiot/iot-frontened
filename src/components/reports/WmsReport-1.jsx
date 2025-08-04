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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Chip,
  Divider
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const MotorHistoryReport = () => {
  const [motors, setMotors] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState('');
  const [selectedMotorName, setSelectedMotorName] = useState('');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const ApiUrl = process.env.REACT_APP_API_URL;
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all motors on component mount
  useEffect(() => {
    const fetchMotors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ApiUrl}/wms/motors`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMotors(data);
        if (data.length > 0) {
          setSelectedMotor(data[0]._id);
          setSelectedMotorName(data[0].entityName);
        }
      } catch (err) {
        setError('Failed to fetch motors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMotors();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMotor || !startDate || !endDate) {
      setError('Please select a motor and date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPage(0);
      
      // Format dates to YYYY-MM-DD format
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      
      const response = await fetch(
        `${ApiUrl}/wms/motor-time-slots?entityId=${selectedMotor}&startDate=${start}&endDate=${end}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTimeSlots(data.slots || []);
    } catch (err) {
      setError('Failed to fetch motor time slots data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return dayjs(date).format('MMM D, YYYY h:mm A');
  };

  // Component for colored duration display
  const DurationCell = ({ start, end, status }) => {
    if (!start) return <TableCell>N/A</TableCell>;
    
    const endTime = end ? new Date(end) : new Date();
    const startTime = new Date(start);
    
    const diffMs = endTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const durationText = `${diffHours}h ${diffMinutes}m`;
    
    return (
      <TableCell>
        <Typography 
          component="span" 
          sx={{ 
            color: status === 'ON' ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          {durationText}
        </Typography>
      </TableCell>
    );
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedData = timeSlots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Motor Operation Time Slots Report
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Motor and Date Range
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="motor-select-label">Motor Controller</InputLabel>
              <Select
                labelId="motor-select-label"
                value={selectedMotor}
                label="Motor Controller"
                onChange={(e) => {
                  const selected = motors.find(m => m._id === e.target.value);
                  setSelectedMotor(e.target.value);
                  setSelectedMotorName(selected?.entityName || '');
                }}
                disabled={loading || motors.length === 0}
              >
                {motors.map((motor) => (
                  <MenuItem key={motor._id} value={motor._id}>
                    {motor.entityName} ({motor.deviceName})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          disabled={loading || !selectedMotor || !startDate || !endDate}
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
      
      {timeSlots.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Operation Time Slots for {selectedMotorName}
            </Typography>
            <Typography variant="subtitle1">
              {motors.find(m => m._id === selectedMotor)?.deviceName}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((slot, index) => {
                  const absoluteIndex = page * rowsPerPage + index;
                  return (
                    <TableRow key={absoluteIndex} hover>
                      <TableCell>{absoluteIndex + 1}</TableCell>
                      <TableCell>{formatDateTime(slot.start)}</TableCell>
                      <TableCell>{formatDateTime(slot.end)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={slot.status} 
                          color={slot.status === 'ON' ? 'success' : 'error'} 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                            minWidth: 80
                          }}
                        />
                      </TableCell>
                      <DurationCell 
                        start={slot.start} 
                        end={slot.end} 
                        status={slot.status} 
                      />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={timeSlots.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '.MuiTablePagination-toolbar': {
                paddingLeft: 0
              }
            }}
          />
        </Paper>
      )}
    </Container>
  );
};

export default MotorHistoryReport;