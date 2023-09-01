import { AppBar, Avatar, BottomNavigation, BottomNavigationAction, Box, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { AdminPanelSettings, ArrowBack, Brightness6, DarkMode, FoodBank, FormatListBulleted, Groups, LightMode, Logout, QueryStats } from '@mui/icons-material';
import { ReactElement } from 'react';
import { invertTheme, useAppTheme } from '../lib/theme';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { useFirestoreUser } from '../lib/firestoreHooks';

type PageLayoutProps = {
  children: ReactElement,
  title: string,
  backTo: string | undefined,
  hideBottomNavigation: boolean,
  hideTopBar: boolean,
};

const defaultProps: Partial<PageLayoutProps> = {
    backTo: undefined,
    hideBottomNavigation: false,
};

const ToggleThemeButton = () => {
    const [theme, setTheme] = useAppTheme();

    return (
        <IconButton
            size="large"
            color="inherit"
            onClick={() => setTheme(invertTheme(theme!))}
        >
            {theme === 'dark' ? (
                <LightMode />
            ) : (
                <DarkMode />
            )}
        </IconButton>
    );
};

const PageLayout = ({ children, title, backTo, hideBottomNavigation, hideTopBar }: PageLayoutProps) => {
    const router = useRouter();
    const user = useFirestoreUser();
    const handleLogout = async () => {
        await signOut(getAuth());
    };

    return (
        <Container maxWidth="md" disableGutters>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}>
                {!hideTopBar && (
                    <AppBar position="sticky">
                        <Toolbar>
                            {backTo !== undefined ? (
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    onClick={() => router.push(backTo)}
                                >
                                    <ArrowBack />
                                </IconButton>
                            ) : (
                                <Avatar src='logo_white.jpg' sx={{ mr: '16px' }} />
                            )}

                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                {title}
                            </Typography>
                            {user?.isAdmin && (
                                <IconButton
                                    onClick={() => router.push('/staffs')}
                                    size="large"
                                    edge="end"
                                    color="inherit"
                                    sx={{
                                        marginRight: 0,
                                    }}
                                >
                                    <AdminPanelSettings />
                                </IconButton>
                            )}
                            <ToggleThemeButton />
                            <IconButton
                                onClick={handleLogout}
                                size="large"
                                edge="end"
                                color="inherit">
                                <Logout />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                )}

                <>
                    {children}
                </>

                {!hideBottomNavigation &&
                    <BottomNavigation
                        value={router.pathname}
                        onChange={(e, route) => router.push(route)}
                        showLabels
                        color="inherit"
                        sx={{
                            '.MuiBottomNavigationAction-label': {
                                fontSize: '10px',
                            },
                            '.MuiBottomNavigationAction-label.Mui-selected': {
                                fontSize: '12px',
                            },
                        }}
                    >
                        <BottomNavigationAction value={'/'} label="Commandes" icon={<FormatListBulleted />} color="inherit" />
                        <BottomNavigationAction value={'/accounts'} label="Comptes" icon={<Groups />} color="inherit" />
                        <BottomNavigationAction value={'/products'} label="Plats" icon={<FoodBank />} color="inherit" />
                        <BottomNavigationAction value={'/stats'} label="Stats" icon={<QueryStats/>} color="inherit" />
                    </BottomNavigation>
                }
            </Box>
        </Container>
    );
};
PageLayout.defaultProps = defaultProps;

export default PageLayout;
