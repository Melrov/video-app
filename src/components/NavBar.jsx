import { useCallback, useState } from "react";
import { connect } from "react-redux";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import useFetch from "../shared/hooks/useFetch";
import Theme from "./Theme";
import { clearUser } from "../redux/actions/user.actions";

let activeStyle = {
  color: "white",
  textDecoration: "underline",
  textDecorationColor: "#2DE1FC",
};
let nonActiveStyle = {
  textDecoration: "none",
  color: "white",
};

const List = styled.ul`
  display: flex;
  list-style-type: none;
  text-decoration: none;
  padding: 0px;
  padding-left: 10px;
`;
const ListItem = styled.li`
  margin-right: 4px;
`;
const Con = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.colors.secondary};
  margin: 0px;
  padding: 0px;
  justify-content: center;
`;
const NavTitle = styled.h2`
  margin: 0px;
  margin-left: 10px;
  &:hover {
    color: ${props => props.theme.colors.accent};
  }
`;

function NavBar({ user, clearLoggedInUser }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { logout: apiLogout } = useFetch();
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = useCallback(async () => {
    const res = await apiLogout();
    if (res.success) {
      clearLoggedInUser();
    }
  }, [apiLogout, clearLoggedInUser]);
  return (
    <Theme>
      <Con>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "space-between",
            width: "80%",
            maxWidth: "1285px",
          }}
        >
          <List>
            <ListItem>
              <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : nonActiveStyle)}>
                <NavTitle>Home</NavTitle>
              </NavLink>
            </ListItem>
            <ListItem>
              {user && (
                <NavLink to="/upload" style={({ isActive }) => (isActive ? activeStyle : nonActiveStyle)}>
                  <NavTitle>Upload</NavTitle>
                </NavLink>
              )}
            </ListItem>
          </List>
          <Box sx={{ paddingRight: 3 }}>
            {user && (
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>{user.charAt(0).toUpperCase()}</Avatar>
                </IconButton>
              </Tooltip>
            )}
            {!user && <NavLink to="/login">Login</NavLink>}
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* <MenuItem>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem>
          <Avatar /> My account
        </MenuItem>
        <Divider /> */}
          {/* <MenuItem onClick={() => navigate(`/channel/${user}`)}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem> */}
          <MenuItem onClick={() => logout()}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Con>
    </Theme>
  );
}

const mapStateToProps = (state) => ({
  user: state.user.user,
});

const mapDispatchToProps = {
  clearLoggedInUser: clearUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
