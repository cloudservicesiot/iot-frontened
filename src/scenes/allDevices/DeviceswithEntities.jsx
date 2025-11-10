import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Chip, Typography, CircularProgress, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";

const ApiUrl = process.env.REACT_APP_API_URL;

// Define the columns for the DataGrid with all device and entity fields
const columns = [
  { 
    field: "deviceName", 
    headerName: "Device Name", 
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Typography variant="body2" fontWeight="bold">
        {params.value || 'N/A'}
      </Typography>
    )
  },
  { 
    field: "deviceId", 
    headerName: "Device ID", 
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value || 'N/A'}
      </Typography>
    )
  },
  // { 
  //   field: "deviceStatus", 
  //   headerName: "Device Status", 
  //   flex: 1,
  //   minWidth: 120,
  //   renderCell: (params) => (
  //     <Chip 
  //       label={params.value || 'offline'} 
  //       color={params.value === 'online' ? 'success' : 'error'}
  //       size="small"
  //     />
  //   )
  // },
  { 
    field: "deviceIsActive", 
    headerName: "Device Active", 
    flex: 1,
    minWidth: 120,
    type: "boolean",
    renderCell: (params) => (
      <Chip 
        label={params.value ? 'Active' : 'Inactive'} 
        color={params.value ? 'success' : 'default'}
        size="small"
      />
    )
  },
  { 
    field: "entityName", 
    headerName: "Entity Name", 
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Typography variant="body2" fontWeight="medium">
        {params.value || 'N/A'}
      </Typography>
    )
  },
  { 
    field: "entityId", 
    headerName: "Entity ID", 
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value || 'N/A'}
      </Typography>
    )
  },
  { 
    field: "stateType", 
    headerName: "State Type", 
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip 
        label={params.value || 'N/A'} 
        color="primary"
        size="small"
        variant="outlined"
      />
    )
  },
  { 
    field: "state", 
    headerName: "Current State", 
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const stateValue = params.value;
      let displayValue = 'N/A';
      let color = 'default';
      
      if (typeof stateValue === 'boolean') {
        displayValue = stateValue ? 'ON' : 'OFF';
        color = stateValue ? 'success' : 'error';
      } else if (typeof stateValue === 'number') {
        displayValue = stateValue.toString();
        color = 'primary';
      } else if (typeof stateValue === 'string') {
        displayValue = stateValue;
        color = 'primary';
      }
      
      return (
        <Chip 
          label={displayValue} 
          color={color}
          size="small"
        />
      );
    }
  },
  { 
    field: "subscribeTopic", 
    headerName: "Subscribe Topic", 
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {params.value || 'N/A'}
      </Typography>
    )
  },
  { 
    field: "publishTopic", 
    headerName: "Publish Topic", 
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {params.value || 'N/A'}
      </Typography>
    )
  },
  { 
    field: "entityIsActive", 
    headerName: "Entity Active", 
    flex: 1,
    minWidth: 120,
    type: "boolean",
    renderCell: (params) => (
      <Chip 
        label={params.value ? 'Active' : 'Inactive'} 
        color={params.value ? 'success' : 'default'}
        size="small"
      />
    )
  },
  { 
    field: "createdAt", 
    headerName: "Created", 
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
      </Typography>
    )
  }
];

const DevicesAndEntities = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to hold the data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the correct endpoint for devices with entities
        const response = await axios.get(`${ApiUrl}/device/devicewithentities`);
        
        if (response.data.success) {
          // Transform the data to flatten the structure for better display
          const transformedData = [];
          
          response.data.data.forEach(device => {
            if (device.entities && device.entities.length > 0) {
              // If device has entities, create a row for each entity
              device.entities.forEach(entity => {
                // Skip null entities (from devices with no entities)
                if (entity.entityName) {
                  transformedData.push({
                    _id: `${device._id}-${entity.entityId}`,
                    deviceName: device.name,
                    deviceId: device.deviceId || device._id,
                    // deviceStatus: device.status || 'offline',
                    deviceIsActive: device.isActive,
                    entityName: entity.entityName,
                    entityId: entity.entityId,
                    stateType: entity.stateType,
                    state: entity.state,
                    subscribeTopic: entity.subscribeTopic,
                    publishTopic: entity.publishTopic,
                    entityIsActive: entity.isActive,
                    createdAt: device.createdAt,
                    updatedAt: device.updatedAt
                  });
                }
              });
            } else {
              // If device has no entities, create a row for the device only
              transformedData.push({
                _id: device._id,
                deviceName: device.name,
                deviceId: device.deviceId || device._id,
                deviceStatus: device.status || 'offline',
                deviceIsActive: device.isActive,
                entityName: 'No Entities',
                entityId: 'N/A',
                stateType: 'N/A',
                state: 'N/A',
                subscribeTopic: 'N/A',
                publishTopic: 'N/A',
                entityIsActive: false,
                createdAt: device.createdAt,
                updatedAt: device.updatedAt
              });
            }
          });
          
          setData(transformedData);
        } else {
          setError('Failed to fetch data from server');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.msg || error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading devices and entities...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Header
          title="Devices & Entities"
          subtitle="Error loading data"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="Devices & Entities"
        subtitle={`List of ${data.length} device-entity combinations`}
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700] + " !important",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: colors.blueAccent[700] + " !important",
            },
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f0f0f0",
            padding: "12px 16px",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f8f9fa",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
            fontWeight: "600",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700] + " !important",
            borderBottom: "none",
            borderRadius: "12px 12px 0 0",
            "& .MuiDataGrid-columnHeader": {
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              "&:last-child": {
                borderRight: "none",
              },
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "white !important",
              fontWeight: "600",
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-sortIcon": {
              color: "white !important",
            },
            "& .MuiDataGrid-menuIcon": {
              color: "white !important",
            },
            "& .MuiDataGrid-columnHeaderTitleContainerContent": {
              color: "white !important",
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#ffffff",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "2px solid #e0e0e0",
            backgroundColor: colors.blueAccent[700] + " !important",
            borderRadius: "0 0 12px 12px",
            "& .MuiTablePagination-root": {
              color: "white !important",
            },
            "& .MuiTablePagination-selectLabel": {
              color: "white !important",
            },
            "& .MuiTablePagination-displayedRows": {
              color: "white !important",
            },
            "& .MuiTablePagination-select": {
              color: "white !important",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3) !important",
              },
            },
            "& .MuiIconButton-root": {
              color: "white !important",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1) !important",
              },
            },
            "& .MuiTablePagination-toolbar": {
              color: "white !important",
            },
            "& .MuiTablePagination-selectIcon": {
              color: "white !important",
            },
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e0e0e0",
            padding: "12px 16px",
            "& .MuiButton-text": {
              color: `${colors.grey[700]} !important`,
              fontWeight: "500",
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
              },
            },
            "& .MuiInputBase-root": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d0d0d0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#667eea",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#667eea",
              },
            },
          },
          "& .MuiDataGrid-row": {
            "&:nth-of-type(even)": {
              backgroundColor: "#fafafa",
            },
            "&:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          disableSelectionOnClick
          autoHeight={false}
        />
      </Box>
    </Box>
  );
};

export default DevicesAndEntities;