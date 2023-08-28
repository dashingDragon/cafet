import { Avatar, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import React from 'react';
import { Account } from '../lib/accounts';
import { DarkMode, LightMode, Logout, Settings } from '@mui/icons-material';
import ProductMenu from './productMenu';
import { invertTheme, useAppTheme } from '../lib/theme';

export const CustomerView: React.FC<{
    account: Account,
}> = ({ account }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [theme, setTheme] = useAppTheme();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeTheme = () => {
        setTheme(invertTheme(theme!));
        handleClose();
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    return (
        <Stack
            flexGrow={1}
            direction="column"
            pb={4}
            maxHeight='100%'
            width='100%'
        >
            <Stack sx={{
                p: 2,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <Typography variant="h6">
                    Bonjour <strong>{account.firstName}</strong> !
                </Typography>

                <IconButton onClick={handleClick}>
                    <Avatar
                        src={user?.photoURL ?? ''}
                        sx={{
                            mr: 1,
                            background: 'default',
                            fontSize: '12px',
                            color: 'white',
                        }}
                    >
                        <Typography variant="body1">
                            {[account.firstName[0].toUpperCase(), account.lastName[0].toUpperCase()].join('')}
                        </Typography>
                    </Avatar>
                </IconButton>
            </Stack>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleChangeTheme}>
                    <ListItemIcon>
                        {theme === 'dark' ? (
                            <LightMode fontSize="small" />
                        ) : (
                            <DarkMode fontSize="small" />
                        )}
                    </ListItemIcon>
                    Thème
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Déconnexion
                </MenuItem>
            </Menu>

            <Typography variant="body1" px={2}>
                {'Que voulez-vous manger aujourd\'hui ?'}
            </Typography>

            <ProductMenu account={account} />
        </Stack>
    );
};