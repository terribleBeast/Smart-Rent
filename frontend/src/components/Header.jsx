import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useDispatch } from 'react-redux'
import { toLogIn } from '../userSlice';
import { users } from '../features/utils';

const Header = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [selectedUser, setSelectedUser] = useState(users[0]);
    const dispatch = useDispatch()
    dispatch(toLogIn({
        name: selectedUser.name,
        address: selectedUser.address,
        balance: selectedUser.balance
    }))

    const handleMenuClose = () => {
        setAnchorEl(null);
        // handleMobileMenuClose();
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddressClick = (user) => {
        setSelectedUser(user)
        dispatch(toLogIn({
            address: selectedUser.address,
            balance: selectedUser.balance
        }))
    }

    console.log(users[0].address)
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >

            {users.map((user, idx) => (
                <MenuItem onClick={() => {
                    handleAddressClick(user);
                    handleMenuClose();
                }} id={idx} >
                    {user.name}
                </MenuItem>
            ))}

        </Menu >
    );

    return (
        <header>
            <AppBar position='static'>
                <Toolbar >
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Smart Rent
                    </Typography>

                    <Typography sx={{
                        mr: 5
                    }}>
                        Name: {selectedUser.name}
                    </Typography>
                    <Typography>
                        Balance: {selectedUser.balance}
                    </Typography>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </header>
    );
}

export default Header;
