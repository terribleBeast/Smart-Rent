import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrUser, selectUsersAll, toUpdate, toLog } from '../usersSlice';

const Header = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const user = useSelector(selectCurrUser)
    const users = useSelector(selectUsersAll)
    const [selectedUser, setSelectedUser] = useState(user);
    const dispatch = useDispatch()


    console.log(users)

    // useEffect(() =>{
    //     const newUsers = users.map(_user => _user.name === selectedUser.name ? { ..._user, balance: selectedUser.balance } : _user )
    //     dispatch(toUpdate(newUsers))}, []        
    // )

    useEffect(() => {
        if (!selectedUser) return;
        dispatch(toLog({user: selectedUser}));

        
    }, [selectedUser, dispatch, user]);

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddressClick = (user) => {
        setSelectedUser(user);
        if (user) {
            dispatch(toLog({user: selectCurrUser}));
        }
    }

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

            {users?.map((user, idx) => (
                <MenuItem onClick={() => {
                    handleAddressClick(user);
                    handleMenuClose();
                }} key={idx}>
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
                        Name: {user ? user.name : ""}
                    </Typography>
                    <Typography>
                        Balance: {user ? user.balance : ""}
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
