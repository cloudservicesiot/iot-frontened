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
  TablePagination
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ACHistoryReport = () => {
  const [acDevices, setAcDevices] = useState([]);
  const [selectedAC, setSelectedAC] = useState('');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);
  const ApiUrl = process.env.REACT_APP_API_URL;
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all AC devices on component mount
  useEffect(() => {
    const fetchACDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ApiUrl}/ac/get/allac`);
        const { data } = await response.json();
        setAcDevices(data);
        if (data.length > 0) {
          setSelectedAC(data[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch AC devices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchACDevices();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAC || !startDate || !endDate) {
      setError('Please select an AC and date range');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPage(0); // Reset to first page when new data is loaded
      
      // Format dates to YYYY-MM-DD format
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      
      const response = await fetch(
        `${ApiUrl}/ac/air-conditioner-history-byId?airConditionerId=${selectedAC}&startDate=${start}&endDate=${end}`
      );
      const { data } = await response.json();
      setHistoryData(data);
    } catch (err) {
      setError('Failed to fetch AC history data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
  const paginatedData = historyData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        AC Mode History Report
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select AC and Date Range
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="ac-select-label">AC Device</InputLabel>
              <Select
                labelId="ac-select-label"
                value={selectedAC}
                label="AC Device"
                onChange={(e) => setSelectedAC(e.target.value)}
                disabled={loading}
              >
                {acDevices.map((ac) => (
                  <MenuItem key={ac._id} value={ac._id}>
                    {ac.devicename}
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
          disabled={loading || !selectedAC || !startDate || !endDate}
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
      
      {historyData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mode History for {acDevices.find(ac => ac._id === selectedAC)?.devicename}
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
                </TableRow>
                </TableHead>
              <TableBody>
                {paginatedData.map((record, index) => {
                  const absoluteIndex = page * rowsPerPage + index;
                  const dateTime = dayjs(record.timestamp);
                  return (
                    <TableRow key={record._id} hover>
                      <TableCell>{absoluteIndex + 1}</TableCell>
                      <TableCell>{dateTime.format('MMM D, YYYY')}</TableCell>
                      <TableCell>{dateTime.format('h:mm A')}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{record.mode}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={historyData.length}
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

export default ACHistoryReport;