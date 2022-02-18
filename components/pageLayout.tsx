import { AppBar, BottomNavigation, BottomNavigationAction, Container, IconButton, Toolbar, Typography } from "@mui/material";
import { Groups, SportsBar, AdminPanelSettings, ArrowBack, Brightness6, Logout } from "@mui/icons-material";
import { ReactElement } from "react";
import { invertTheme, useAppTheme } from "../lib/theme";

interface PageLayoutProps {
    children: ReactElement,
}

const ToggleThemeButton = () => {
    const [theme, setTheme] = useAppTheme();

    return (
        <IconButton
            size="large"
            color="inherit"
            onClick={() => setTheme(invertTheme(theme!))}>
            <Brightness6 />
        </IconButton>
    );
};

const PageLayout = ({ children }: PageLayoutProps) => {
    return (
        <Container maxWidth="md" disableGutters>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit">
                        <ArrowBack />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Oui
                    </Typography>

                    <ToggleThemeButton />
                    <IconButton
                        size="large"
                        edge="end"
                        color="inherit">
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {children}
            <BottomNavigation showLabels color="inherit">
                <BottomNavigationAction label="Comptes" icon={<Groups />} color="inherit" />
                <BottomNavigationAction label="Bières" icon={<SportsBar />} color="inherit" />
                <BottomNavigationAction label="Staff" icon={<AdminPanelSettings />} color="inherit" />
            </BottomNavigation>
        </Container>
    );
};

export default PageLayout;
