import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Box,
  useTheme,
  TextField,
  InputAdornment,
  Paper,
  IconButton
} from '@mui/material';
import { 
  ElectricMeter as MeterIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const ApiUrl = process.env.REACT_APP_API_URL;

const EnergyMeters = () => {
  const [energyMeters, setEnergyMeters] = useState([]);
  const [filteredMeters, setFilteredMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchEnergyMeters = async () => {
      try {
        const response = await fetch(`${ApiUrl}/energy/meters`);
        const data = await response.json();
        setEnergyMeters(data);
        setFilteredMeters(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch energy meters. Please try again later.");
        setLoading(false);
      }
    };

    fetchEnergyMeters();
  }, []);

  // Filter meters based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMeters(energyMeters);
    } else {
      const filtered = energyMeters.filter(meter => 
        meter.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.state.toString().includes(searchTerm)
      );
      setFilteredMeters(filtered);
    }
  }, [searchTerm, energyMeters]);

  const getTotalEnergy = () => {
    return filteredMeters.reduce((total, meter) => total + parseInt(meter.state, 10), 0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Energy Consumption Dashboard
        </Typography>
        
        {/* Search Filter */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            fullWidth
            placeholder="Search energy meters by device name, entity name, or energy value..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          {searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing {filteredMeters.length} of {energyMeters.length} meters
            </Typography>
          )}
        </Paper>
        
        {/* Summary Card */}
        <Card sx={{ 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          boxShadow: theme.shadows[4]
        }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <MeterIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Total Energy Consumption
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {getTotalEnergy()} Wh
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Across all connected meters
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Meters Grid */}
        <Grid container spacing={3}>
          {filteredMeters.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No energy meters found matching your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search terms
                </Typography>
              </Card>
            </Grid>
          ) : (
            filteredMeters.map((meter) => (
            <Grid item xs={12} sm={6} md={4} key={meter._id}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box position="relative" display="inline-flex" mr={3}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={80}
                        thickness={5}
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: theme.palette.grey[200],
                          borderRadius: '50%',
                          padding: '4px'
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" fontWeight="600">
                          {meter.state}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {meter.deviceName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meter.entityName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {parseInt(meter.state, 10)} Watt-hours
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<InfoIcon />}
                    onClick={() => navigate(`/energy/meters/detail/${meter._id}`, {
                      state: {
                        deviceName: meter.deviceName,
                        entityName: meter.entityName,
                        state: meter.state,
                        meterId: meter._id,
                      },
                    })}
                    sx={{ textTransform: 'none' }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            ))
          )}
        </Grid>
      </Box>
    </>
  );
};

export default EnergyMeters;