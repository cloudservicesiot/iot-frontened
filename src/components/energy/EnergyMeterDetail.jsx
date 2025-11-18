import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem, Grid, Box, useTheme, Chip, Avatar, Stack, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, ToggleButton, ToggleButtonGroup, Breadcrumbs, Link } from "@mui/material";
import { Home, ChevronRight } from "@mui/icons-material";
import { format, subHours, subDays, subMonths, subYears, startOfHour, startOfDay, startOfMonth, eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval, addHours, addDays, parseISO } from "date-fns";
import axios from "axios";
import mqtt from 'mqtt';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Custom DateRangePicker component using free DatePicker
const CustomDateRangePicker = ({ value, onChange, sx = {} }) => {
  const [startDate, endDate] = value || [null, null];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 1,
        border: '1px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'rgba(255,255,255,0.5)'
        },
        '&:focus-within': {
          borderColor: 'rgba(255,255,255,0.7)'
        },
        ...sx
      }}
    >
      <DatePicker
        value={startDate}
        onChange={(newValue) => {
          onChange([newValue, endDate]);
        }}
        maxDate={endDate || dayjs()}
        slotProps={{
          textField: {
            size: 'small',
            placeholder: 'From Date',
            sx: {
              '& .MuiOutlinedInput-root': {
                color: 'white',
                border: 'none',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover fieldset': {
                  border: 'none'
                },
                '&.Mui-focused fieldset': {
                  border: 'none'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: 'rgba(255,255,255,0.9)'
                }
              },
              '& .MuiInputBase-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1
                }
              },
              '& .MuiSvgIcon-root': {
                color: 'white'
              }
            }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 0
          }
        }}
      />
      <Box
        sx={{
          width: '1px',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          mx: 0.5
        }}
      />
      <DatePicker
        value={endDate}
        onChange={(newValue) => {
          onChange([startDate, newValue]);
        }}
        minDate={startDate}
        maxDate={dayjs()}
        slotProps={{
          textField: {
            size: 'small',
            placeholder: 'To Date',
            sx: {
              '& .MuiOutlinedInput-root': {
                color: 'white',
                border: 'none',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover fieldset': {
                  border: 'none'
                },
                '&.Mui-focused fieldset': {
                  border: 'none'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: 'rgba(255,255,255,0.9)'
                }
              },
              '& .MuiInputBase-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1
                }
              },
              '& .MuiSvgIcon-root': {
                color: 'white'
              }
            }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 0
          }
        }}
      />
    </Box>
  );
};
  
const typeMap = {
  '12h': 'hourly',
  '24h': 'hourly',
  '7d': 'daily',
  '15d': 'daily',
  '30d': 'daily',
  '12m': 'monthly',
  'yearly': 'yearly'
};

// Define the special meter IDs and their pairs
const specialMeterPairs = {
  '686b58ec216df753a7cb6088': ['6801053b097550e68a379420'], // Same ID for second API
  // '67f8d1634233a1f71aea4b2f': ['682da36bc4753587e7c25817'],
  '680102fc097550e68a37940e': ['686b6c24e3a6c731e66cc9a0'],
  '6856bc0a9829f2f0badf259d': ['6856bc689829f2f0badf259f', '6856bc8e9829f2f0badf25a1'] // Three charts case
};

const getRange = (timeRange) => {
  const now = new Date();
  let start;
  switch (timeRange) {
    case '12h': 
      start = subHours(now, 12);
      return { 
        start: startOfHour(start).toISOString(), 
        end: startOfHour(now).toISOString(),
        type: 'hourly'
      };
    case '24h': 
      start = subHours(now, 24);
      return { 
        start: startOfHour(start).toISOString(), 
        end: startOfHour(now).toISOString(),
        type: 'hourly'
      };
    case '7d':
      start = subDays(now, 7);
      return { 
        start: startOfDay(start).toISOString(), 
        end: startOfDay(now).toISOString(),
        type: 'daily'
      };
    case '15d':
      start = subDays(now, 15);
      return { 
        start: startOfDay(start).toISOString(), 
        end: startOfDay(now).toISOString(),
        type: 'daily'
      };
    case '30d':
      start = subDays(now, 30);
      return { 
        start: startOfDay(start).toISOString(), 
        end: startOfDay(now).toISOString(),
        type: 'daily'
      };
    case '12m':
      start = subMonths(now, 12);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { 
        start: startOfMonth(start).toISOString(), 
        end: end.toISOString(), 
        type: 'monthly'
      };
    case 'yearly':
      start = subYears(now, 1);
      return { 
        start: startOfMonth(start).toISOString(), 
        end: startOfMonth(now).toISOString(),
        type: 'yearly'
      };
    default: 
      start = subHours(now, 24);
      return { 
        start: startOfHour(start).toISOString(), 
        end: startOfHour(now).toISOString(),
        type: 'hourly'
      };
  }
};

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { deviceName, entityName, state, meterId } = location.state || {};
  const theme = useTheme();

  const [energyData, setEnergyData] = useState([]);
  const [additionalEnergyData, setAdditionalEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [additionalLoading, setAdditionalLoading] = useState([]);
  const [error, setError] = useState(null);
  const [associatedEntities, setAssociatedEntities] = useState([]);
  const [additionalAssociatedEntities, setAdditionalAssociatedEntities] = useState([]);
  const [additionalDeviceInfo, setAdditionalDeviceInfo] = useState([]);
  const ApiUrl = process.env.REACT_APP_API_URL;
  
  // Unified filter state
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(1, 'day'),
    dayjs()
  ]);
  const [interval, setInterval] = useState('1h'); // 1h, 2h, 4h, 8h, 12h, 1d
  
  // State to track applied filters (for fetching data)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: format(dayjs().subtract(1, 'day').toDate(), 'yyyy-MM-dd'),
    endDate: format(dayjs().toDate(), 'yyyy-MM-dd'),
    interval: '1h'
  });
  
  // Table data state (now includes all entity values)
  const [tableData, setTableData] = useState([]);
  const [additionalTableData, setAdditionalTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Use applied filters for API calls (not the current filter state)
  const startDate = appliedFilters.startDate;
  const endDate = appliedFilters.endDate;
  const appliedInterval = appliedFilters.interval;
  
  // Check if this is a special meter that needs additional charts
  const isSpecialMeter = useMemo(() => Object.keys(specialMeterPairs).includes(meterId), [meterId]);
  const additionalMeterIds = useMemo(() => isSpecialMeter ? specialMeterPairs[meterId] : [], [isSpecialMeter, meterId]);

  // Enhanced color palette
  const colorPalette = {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    success: '#4facfe',
    warning: '#f093fb',
    info: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    entityColors: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ]
  };

  // Interval options
  const intervalOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '2h', label: '2 Hours' },
    { value: '4h', label: '4 Hours' },
    { value: '8h', label: '8 Hours' },
    { value: '12h', label: '12 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1m', label: '1 Month' }
  ];

  // Helper function to get unit for entity
  const getEntityUnit = (entityName) => {
    const name = entityName.toLowerCase();
    if (name.includes('current')) return 'A';
    if (name.includes('voltage')) return 'V';
    if (name.includes('power') && !name.includes('factor')) return 'W';
    if (name.includes('energy')) return 'Wh';
    if (name.includes('frequency')) return 'Hz';
    if (name.includes('factor')) return '';
    return '';
  };

  // Helper function to get icon for entity
  const getEntityIcon = (entityName) => {
    const name = entityName.toLowerCase();
    if (name.includes('current')) return '⚡';
    if (name.includes('voltage')) return '🔌';
    if (name.includes('power') && !name.includes('factor')) return '💡';
    if (name.includes('energy')) return '🔋';
    if (name.includes('frequency')) return '📊';
    if (name.includes('factor')) return '📈';
    return '⚙️';
  };

  // Helper function to determine collection type based on interval
  const getCollectionType = (interval) => {
    if (interval === '1m') return 'monthly';
    if (interval === '1d') return 'daily';
    if (['1h', '2h', '4h', '8h', '12h'].includes(interval)) return 'hourly';
    return 'hourly';
  };

  // Helper function to get interval in hours
  const getIntervalHours = (interval) => {
    const map = { '1h': 1, '2h': 2, '4h': 4, '8h': 8, '12h': 12, '1d': 24, '1m': 24 * 30 };
    return map[interval] || 1;
  };

  // Function to sample energy data based on interval
  const sampleEnergyData = (data, interval) => {
    if (!data || data.length === 0) return [];
    
    const intervalHours = getIntervalHours(interval);
    const sampled = [];
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sortedData.length === 0) return [];
    
    let currentTime = new Date(sortedData[0].timestamp);
    const endTime = new Date(sortedData[sortedData.length - 1].timestamp);
    
    while (currentTime <= endTime) {
      // Find the closest data point to currentTime
      let closest = sortedData[0];
      let minDiff = Math.abs(new Date(closest.timestamp) - currentTime);
      
      for (const item of sortedData) {
        const diff = Math.abs(new Date(item.timestamp) - currentTime);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item;
        }
      }
      
      // Only add if within reasonable range (half the interval)
      const maxDiff = (intervalHours * 60 * 60 * 1000) / 2; // half interval in milliseconds
      if (minDiff <= maxDiff) {
        sampled.push(closest);
      }
      
      // Move to next interval
      currentTime = addHours(currentTime, intervalHours);
    }
    
    return sampled;
  };

  // Function to find nearest raw entity value for a given timestamp
  const findNearestEntityValue = (rawData, targetTimestamp) => {
    if (!rawData || rawData.length === 0) return null;
    
    let nearest = rawData[0];
    let minDiff = Math.abs(new Date(rawData[0].time) - new Date(targetTimestamp));
    
    for (const item of rawData) {
      const diff = Math.abs(new Date(item.time) - new Date(targetTimestamp));
      if (diff < minDiff) {
        minDiff = diff;
        nearest = item;
      }
    }
    
    // Only return if within 5 minutes of target (300000 milliseconds = 5 minutes)
    if (minDiff <= 5 * 60 * 1000) {
      return nearest;
    }
    
    return null;
  };

  const fetchEnergyData = async (meterId, index = -1, filterOverrides = null) => {
    try {
      if (index >= 0) {
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = true;
          return newLoading;
        });
      } else {
        setLoading(true);
      }
      
      // Use override values if provided, otherwise use applied filters
      const filterStartDate = filterOverrides?.startDate || startDate;
      const filterEndDate = filterOverrides?.endDate || endDate;
      const filterInterval = filterOverrides?.interval || appliedInterval;
      
      // Convert date strings to ISO timestamps
      const startDateTime = new Date(filterStartDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(filterEndDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      const type = getCollectionType(filterInterval);
      
      const res = await axios.get(`${ApiUrl}/energy/energy-meter-data`, {
        params: {
          entityId: meterId,
          type,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString()
        }
      });
      
      const sortedData = res.data.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Sample data based on interval
      const sampledData = sampleEnergyData(sortedData, filterInterval);
      
      if (index >= 0) {
        setAdditionalEnergyData(prev => {
          const newData = [...prev];
          newData[index] = sampledData;
          return newData;
        });
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      } else {
        setEnergyData(sampledData);
        setLoading(false);
      }
      
      // Return sampled data so it can be used immediately
      return sampledData;
    } catch (err) {
      console.error('Error fetching energy data:', err);
      setError("Failed to fetch energy data. Please try again.");
      if (index >= 0) {
        setAdditionalLoading(prev => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      } else {
        setLoading(false);
      }
      return []; // Return empty array on error
    }
  };


  const fetchAssociatedEntities = async (meterId, index = -1) => {
    try {
      const res = await axios.get(`${ApiUrl}/energy/device-with-entities/${meterId}`);
      
      if (index >= 0) {
        // Update associated entities for additional chart
        setAdditionalAssociatedEntities(prev => {
          const newEntities = [...prev];
          newEntities[index] = res.data.associatedEntities;
          return newEntities;
        });
        // Update device info for additional chart
        setAdditionalDeviceInfo(prev => {
          const newInfo = [...prev];
          newInfo[index] = {
            deviceName: res.data.deviceName,
            entityName: res.data.entityName,
            state: res.data.state
          };
          return newInfo;
        });
      } else {
        setAssociatedEntities(res.data.associatedEntities);
      }
      
      return res.data.associatedEntities;
    } catch (err) {
      console.error('Failed to fetch associated entities:', err);
      return [];
    }
  };

  // Function to prepare table data with only energy consumption data
  const prepareTableData = (energyData, deviceInfo) => {
    if (!energyData || energyData.length === 0) return [];
    
    const tableRows = energyData.map(energyItem => {
      return {
        date: format(new Date(energyItem.timestamp), 'yyyy-MM-dd'),
        time: format(new Date(energyItem.timestamp), 'HH:mm:ss'),
        timestamp: energyItem.timestamp,
        totalValue: energyItem.totalValue || 0,
        totalEnergyConsumption: energyItem.totalEnergyConsumption || NaN
      };
    });
    
    return tableRows;
  };

  // Function to apply filters and fetch data
  const applyFilters = async () => {
    if (!meterId) return;
    
    // Calculate new filter values
    const newStartDate = dateRange[0] ? format(dateRange[0].toDate(), 'yyyy-MM-dd') : format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const newEndDate = dateRange[1] ? format(dateRange[1].toDate(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const newInterval = interval;
    
    // Update applied filters state
    setAppliedFilters({
      startDate: newStartDate,
      endDate: newEndDate,
      interval: newInterval
    });
    
    // Create filter override object to pass directly to fetch functions
    const filterOverrides = {
      startDate: newStartDate,
      endDate: newEndDate,
      interval: newInterval
    };
    
    // Initialize states based on how many additional charts we need
    const additionalCount = isSpecialMeter ? specialMeterPairs[meterId].length : 0;
    setAdditionalEnergyData(Array(additionalCount).fill([]));
    setAdditionalLoading(Array(additionalCount).fill(true));
    setAdditionalAssociatedEntities(Array(additionalCount).fill([]));
    setAdditionalDeviceInfo(Array(additionalCount).fill(null));
    setAdditionalTableData(Array(additionalCount).fill([]));

    // Fetch data for main chart with new filter values
    const fetchMainData = async () => {
      // Fetch energy data
      await fetchEnergyData(meterId, -1, filterOverrides);
      // Fetch associated entities (for display in sidebar, not for table)
      await fetchAssociatedEntities(meterId);
    };
    
    await fetchMainData();
    
    // Fetch data for additional charts if needed
    if (isSpecialMeter) {
      const fetchAdditionalData = async () => {
        for (let index = 0; index < specialMeterPairs[meterId].length; index++) {
          const id = specialMeterPairs[meterId][index];
          // Fetch energy data
          await fetchEnergyData(id, index, filterOverrides);
          // Fetch associated entities (for display in sidebar, not for table)
          await fetchAssociatedEntities(id, index);
        }
      };
      await fetchAdditionalData();
    }
  };

  // Apply filters on initial load
  useEffect(() => {
    if (meterId) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meterId]);

  // Effect to prepare table data when data changes
  useEffect(() => {
    if (energyData.length > 0) {
      const tableRows = prepareTableData(energyData, { deviceName, entityName, state });
      setTableData(tableRows);
    }
    
    // Prepare table data for additional meters
    if (isSpecialMeter) {
      additionalEnergyData.forEach((data, index) => {
        if (data.length > 0) {
          const deviceInfo = additionalDeviceInfo[index] || { deviceName, entityName, state };
          const tableRows = prepareTableData(data, deviceInfo);
          setAdditionalTableData(prev => {
            const newData = [...prev];
            newData[index] = tableRows;
            return newData;
          });
        }
      });
    }
  }, [energyData, additionalEnergyData]);

  const chartData = useMemo(() => {
    if (!energyData || !energyData.length) return [];
    
    return energyData.map(item => {
      const date = new Date(item.timestamp);
      let timeLabel;
      
      // Format based on applied interval
      if (appliedInterval === '1m') {
        timeLabel = format(date, 'MMM yyyy');
      } else if (appliedInterval === '1d') {
        timeLabel = format(date, 'MMM d, yyyy');
      } else if (['1h', '2h', '4h', '8h', '12h'].includes(appliedInterval)) {
        timeLabel = format(date, 'MMM d, HH:mm');
      } else {
        timeLabel = format(date, 'MMM d, HH:mm');
      }
      
      return {
        time: timeLabel,
        totalValue: item.totalValue,
        totalEnergyConsumption: item.totalEnergyConsumption,
        timestamp: item.timestamp,
        fullDate: date
      };
    });
  }, [energyData, appliedInterval]);

  const additionalChartData = useMemo(() => {
    return additionalEnergyData.map(data => {
      if (!data || !data.length) return [];
      
      return data.map(item => {
        const date = new Date(item.timestamp);
        let timeLabel;
        
        // Format based on applied interval
        if (appliedInterval === '1d') {
          timeLabel = format(date, 'MMM d, yyyy');
        } else if (['1h', '2h', '4h', '8h', '12h'].includes(appliedInterval)) {
          timeLabel = format(date, 'MMM d, HH:mm');
        } else {
          timeLabel = format(date, 'MMM d, HH:mm');
        }
        
        return {
          time: timeLabel,
          totalValue: item.totalValue,
          timestamp: item.timestamp,
          fullDate: date
        };
      });
    });
  }, [additionalEnergyData, appliedInterval]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let dateString;
      
      // Format based on applied interval
      if (appliedInterval === '1m') {
        dateString = format(data.fullDate, 'MMMM yyyy');
      } else if (appliedInterval === '1d') {
        dateString = format(data.fullDate, 'MMMM d, yyyy');
      } else {
        dateString = format(data.fullDate, 'MMM d, yyyy HH:mm');
      }
      
      // Format totalEnergyConsumption, handle NaN
      const totalEnergyConsumption = data.totalEnergyConsumption;
      const energyConsumptionDisplay = (totalEnergyConsumption !== null && totalEnergyConsumption !== undefined && !isNaN(totalEnergyConsumption))
        ? totalEnergyConsumption.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : 'N/A';
      
      return (
        <Card sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: 'none',
          borderRadius: 2
        }}>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
            {dateString}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Consumption: <span style={{ fontWeight: 700 }}>{payload[0].value.toLocaleString()} Wh</span>
          </Typography>
          <Typography variant="body2">
            Total Energy: <span style={{ fontWeight: 700 }}>{energyConsumptionDisplay} Wh</span>
          </Typography>
        </Card>
      );
    }
    return null;
  };

  const XAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill="#64b5f6"
          fontSize={12}
          fontWeight={600}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const stats = useMemo(() => {
    if (!energyData || !energyData.length) return null;
    
    const totalUsage = energyData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const peakUsage = energyData.length > 0 ? Math.max(...energyData.map(item => item.totalValue || 0)) : 0;
    const averageUsage = energyData.length > 0 ? totalUsage / energyData.length : 0;
    
    return {
      totalUsage,
      averageUsage: Math.round(averageUsage),
      peakUsage
    };
  }, [energyData]);

  const additionalStats = useMemo(() => {
    return additionalEnergyData.map(data => {
      if (!data || !data.length) return null;
      
      const totalUsage = data.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      const peakUsage = data.length > 0 ? Math.max(...data.map(item => item.totalValue || 0)) : 0;
      const averageUsage = data.length > 0 ? totalUsage / data.length : 0;
      
      return {
        totalUsage,
        averageUsage: Math.round(averageUsage),
        peakUsage
      };
    });
  }, [additionalEnergyData]);

  const isLoading = loading || additionalLoading.some(loading => loading);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="300px"
        sx={{
          background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
          borderRadius: 3,
          p: 4,
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: 'white', mb: 2 }} size={60} />
        <Typography variant="h6" fontWeight={600}>Loading Energy Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        p: 4, 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" fontWeight={600}>{error}</Typography>
      </Card>
    );
  }

  // Table component for displaying energy consumption data only
  const renderTable = (tableData, deviceInfo, index = -1) => {
    const colors = [
      { primary: '#64b5f6', light: '#e3f2fd', header: '#bbdefb' },
      { primary: '#81c784', light: '#e8f5e9', header: '#c8e6c9' },
      { primary: '#ffb74d', light: '#fff3e0', header: '#ffe0b2' },
      { primary: '#ba68c8', light: '#f3e5f5', header: '#e1bee7' }
    ];
    
    const colorScheme = index >= 0 ? colors[index % colors.length] : colors[0];

    // Group table data by date
    const groupedByDate = tableData.reduce((acc, row) => {
      const date = row.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row);
      return acc;
    }, {});

    const dates = Object.keys(groupedByDate).sort();

    return (
      <Card elevation={0} sx={{ 
        borderRadius: 2,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        mt: 3
      }}>
        {/* Header */}
        <Box sx={{ 
          background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%)`,
          p: 2,
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📊 Energy Consumption History
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>
            Data from {startDate} to {endDate} (Interval: {intervalOptions.find(i => i.value === appliedInterval)?.label})
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: colorScheme.header,
                '& .MuiTableCell-head': { 
                  color: '#424242', 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderBottom: `2px solid ${colorScheme.primary}`,
                  whiteSpace: 'nowrap'
                }
              }}>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Total Value (Wh)</TableCell>
                <TableCell align="right">Total Energy Consumption (Wh)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No energy data available for the selected period
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                dates.map((date, dateIndex) => (
                  <React.Fragment key={date}>
                    {/* Date Header Row */}
                    <TableRow sx={{ backgroundColor: colorScheme.light }}>
                      <TableCell 
                        colSpan={4}
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: colorScheme.primary,
                          py: 1.5,
                          borderBottom: `2px solid ${colorScheme.primary}`
                        }}
                      >
                        📅 {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                    {/* Data Rows for this Date */}
                    {groupedByDate[date].map((row, rowIndex) => (
                      <TableRow 
                        key={`${date}-${rowIndex}`}
                        sx={{ 
                          '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: colorScheme.light }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: '#616161' }}>
                          {format(new Date(row.timestamp), 'yyyy-MM-dd')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#616161' }}>{row.time}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: colorScheme.primary }}>
                          {row.totalValue?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: colorScheme.primary }}>
                          {row.totalEnergyConsumption?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  const renderChart = (data, deviceInfo, associatedEntities, stats, index = -1) => {
    const chartColors = [
      { primary: '#64b5f6', light: '#e3f2fd' },
      { primary: '#81c784', light: '#e8f5e9' },
      { primary: '#ffb74d', light: '#fff3e0' },
      { primary: '#ba68c8', light: '#f3e5f5' }
    ];
    
    const colorIndex = index >= 0 ? (index % chartColors.length) : 0;
    const colors = index >= 0 ? chartColors[colorIndex] : chartColors[0];

    return (
      <Grid container spacing={3} key={index}>
        {/* Main Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
              p: 3,
              color: 'white'
            }}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {deviceInfo.deviceName}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
                    {deviceInfo.entityName} • Current: <strong>{deviceInfo.state} Wh</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Box sx={{ height: 400 }}>
                {data && data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <defs>
                      <linearGradient id={`barGradient${index >= 0 ? index : ''}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity={1}/>
                        <stop offset="100%" stopColor={colors.primary} stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false}  
                      stroke="rgba(100, 181, 246, 0.2)"
                    />
                    <XAxis
                      dataKey="time"
                      tick={<XAxisTick />}
                      interval={appliedInterval === '1h' ? 2 : appliedInterval === '2h' ? 1 : appliedInterval === '1d' ? 0 : 'preserveEnd'}
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: 'Energy (Wh)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                          fill: colors.primary,
                          fontSize: 14,
                          fontWeight: 600
                        }
                      }}
                      tick={{ fontSize: 12, fill: colors.primary, fontWeight: 600 }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ 
                        fill: 'rgba(100, 181, 246, 0.15)',
                        radius: 4
                      }}
                    />
                    <Bar
                      dataKey="totalValue"
                      fill={`url(#barGradient${index >= 0 ? index : ''})`}
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="h6" gutterBottom>
                      📊 No Data Available
                    </Typography>
                    <Typography variant="body2">
                      No energy consumption data found for the selected period
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Summary Stats with Entities */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Summary Stats */}
            <Card elevation={0} sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                p: 2,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Summary
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                {stats && (
                  <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.95, display: 'block' }}>
                          💡 Total
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.totalUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Wh</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.95, display: 'block' }}>
                          📈 Average
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.averageUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Wh</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                        borderRadius: 1.5,
                        p: 1.5,
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.95, display: 'block' }}>
                          ⚡ Peak
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                          {stats.peakUsage.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>Wh</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Associated Entities */}
            <Card elevation={0} sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                p: 2,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🔌 Entities
                </Typography>
              </Box>

              <CardContent sx={{ p: 2 }}>
                {associatedEntities.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    background: '#f5f5f5',
                    borderRadius: 1.5
                  }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      📭 No entities found
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {associatedEntities.map((entity, entityIndex) => (
                      <Box 
                        key={entity._id}
                        sx={{ 
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                          borderRadius: 1.5,
                          p: 1.5,
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                            {getEntityIcon(entity.entityName)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={600} 
                            sx={{ 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '120px'
                            }}
                          >
                            {entity.entityName.replace('PZEM-004T V3 ', '')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                          {entity.state} {getEntityUnit(entity.entityName)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      p: 3, 
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        separator={<ChevronRight fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/energy/meters')}
          sx={{
            color: '#64b5f6',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: '#42a5f5'
            },
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Home fontSize="small" />
          Energy Meters
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          {deviceName || 'Energy Meter Detail'}
        </Typography>
      </Breadcrumbs>

      {/* Filters Section at Top */}
      <Card elevation={0} sx={{ 
        borderRadius: 2,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        mb: 3,
        p: 3
      }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#424242' }}>
            📅 Filter Options for {deviceName}
          </Typography>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ mb: 1, color: '#757575', fontWeight: 500 }}>
              Start Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Start Date"
                value={dateRange[0]}
                onChange={(newValue) => {
                  if (newValue) {
                    setDateRange([newValue, dateRange[1]]);
                  }
                }}
                maxDate={dateRange[1] || dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                          backgroundColor: '#eeeeee'
                        }
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ mb: 1, color: '#757575', fontWeight: 500 }}>
              End Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select End Date"
                value={dateRange[1]}
                onChange={(newValue) => {
                  if (newValue) {
                    setDateRange([dateRange[0], newValue]);
                  }
                }}
                minDate={dateRange[0]}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                          backgroundColor: '#eeeeee'
                        }
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ mb: 1, color: '#757575', fontWeight: 500 }}>
              Select Interval
            </Typography>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#eeeeee'
                  }
                }}
              >
                {intervalOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={applyFilters}
              disabled={isLoading}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                color: 'white',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(100, 181, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                  boxShadow: '0 4px 12px rgba(100, 181, 246, 0.4)'
                },
                '&:disabled': {
                  background: '#b0bec5',
                  color: 'white'
                }
              }}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </Grid>
        </Grid>
      </Card>
      {/* First Chart */}
      {renderChart(
        chartData, 
        { entityName, state }, 
        associatedEntities, 
        stats
      )}

      {/* Table for First Chart */}
      {renderTable(
        tableData, 
        { deviceName, entityName, state },
        -1
      )}

      {/* Additional Charts (if special meter) */}
      {isSpecialMeter && additionalDeviceInfo.map((deviceInfo, index) => (
        deviceInfo && (
          <React.Fragment key={index}>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" fontWeight={600} color="text.secondary" sx={{ textAlign: 'center' }}>
                {index === 0 ? 'Second' : 'Third'} Meter Data
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
            
            {renderChart(
              additionalChartData[index], 
              deviceInfo, 
              additionalAssociatedEntities[index], 
              additionalStats[index],
              index
            )}

            {/* Table for Additional Chart */}
            {renderTable(
              additionalTableData[index] || [], 
              deviceInfo,
              index
            )}
          </React.Fragment>
        )
      ))}
    </Box>
  );
};

export default DetailPage;
