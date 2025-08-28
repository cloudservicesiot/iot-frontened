import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const DetailComponent = () => {
  const location = useLocation();
  const { deviceName, entityName, state, entityId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Parse value based on type (ON/OFF or numeric)
  const parseValue = (value) => {
    if (value === "ON") return 1;
    if (value === "OFF") return 0;
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };

  // Format displayed time for a single-day view
  const formatDisplayTime = (iso) => dayjs(iso).format("HH:mm");

  // Fetch data for selected date
  useEffect(() => {
    if (!entityId) {
      setError("Missing entityId.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchGraphData = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateParam = selectedDate ? selectedDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
        const url = `${BASE_URL}/entity-history/entity-raw-history-by-date?entityId=${encodeURIComponent(
          entityId
        )}&date=${encodeURIComponent(dateParam)}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];

        const formattedData = rows
          .slice()
          .sort((a, b) => new Date(a.time) - new Date(b.time))
          .map((item) => ({
            time: item.time,
            displayTime: formatDisplayTime(item.time),
            value: parseValue(item.value),
            rawValue: item.value,
          }));

        setGraphData(formattedData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError("No historic data available for this entity/date.");
          setGraphData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
    return () => controller.abort();
  }, [entityId, selectedDate, BASE_URL]);

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    setSelectedDate(newDate.startOf("day"));
  };

  const renderTooltipContent = (data) => {
    if (!data.payload || !data.payload.length) return null;

    const { time, rawValue } = data.payload[0].payload;
    const formattedDate = dayjs(time).format("MMM D, YYYY h:mm:ss A");

    return (
      <div
        style={{
          background: "white",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <p>{formattedDate}</p>
        <p>
          <strong>Value:</strong> {rawValue}
        </p>
      </div>
    );
  };

  // Choose a tick interval to avoid crowding (aim for ~10–12 ticks)
  const tickInterval = graphData.length > 12 ? Math.floor(graphData.length / 12) : 0;

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Loading Energy Data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Energy Meter Analytics
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {deviceName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {entityName}
          </Typography>
          <Typography variant="body1" mt={1}>
            <strong>Status:</strong> {state}
          </Typography>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-start" mb={3} gap={2} flexWrap="wrap">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} sx={{ minWidth: 220 }} />}
            maxDate={dayjs()}
            disableFuture
          />
        </LocalizationProvider>
      </Box>

      <Box height={400} width="100%">
        {graphData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayTime"
                tick={{ fontSize: 12 }}
                tickMargin={10}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                domain={["auto", "auto"]}
              />
              <Tooltip content={renderTooltipContent} wrapperStyle={{ zIndex: 1000 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4361ee"
                strokeWidth={2}
                dot={graphData.length < 150}
                activeDot={{ r: 5, stroke: "#4361ee", strokeWidth: 2, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6" color="textSecondary">
              No data available for the selected date
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DetailComponent;