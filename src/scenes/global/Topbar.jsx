import { Box, IconButton, Typography, Menu, MenuItem, Avatar, useMediaQuery } from "@mui/material";
import { useContext, useState } from "react";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Topbar = ({ setIsSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // Get username from user object
  const username = user?.username || user?.email?.split('@')[0] || 'User';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/user/login");
  };

  const handleMenuClick = () => {
    if (setIsSidebar) {
      setIsSidebar((prev) => !prev);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      p={1}
      sx={{
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      {/* LEFT SIDE - MENU ICON (MOBILE) & WELCOME TEXT */}
      <Box display="flex" alignItems="center" gap={1}>
        {isMobile && (
          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "600",
            color: "#333",
          }}
        >
          Welcome, {username}
        </Typography>
      </Box>

      {/* RIGHT SIDE - USER MENU */}
      <Box display="flex" alignItems="center">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#1976d2",
              color: "#fff",
            }}
          >
            <PersonOutlinedIcon fontSize="small" />
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                color: "#333",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
