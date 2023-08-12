import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import { PaletteMode, Theme, createTheme } from '@mui/material';
import useLocalStorage from '@rehooks/local-storage';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
    interface Theme {
        colors: {
            main: CSSProperties['color'],
            secondary: CSSProperties['color'],
            tertiary: CSSProperties['color'],
        }
    }
  }

const createThemeMode = (mode: PaletteMode) => {
    const theme = createTheme({
        palette: {
            mode: mode,
            background: {
                default: mode === 'light' ? 'hsla(202, 44%, 96%, 1)' : 'hsla(230, 12%, 24%, 1)',
                paper: mode === 'light' ? '#fff' : 'hsla(224, 13%, 32%, 1)',

            },
            primary: {
                main: 'hsla(145, 100%, 26%, 1)',
            },
            error: {
                light: mode === 'light' ? 'hsla(360, 97%, 71%, 1)' : 'hsla(0, 85%, 70%, 1)',
                main: mode === 'light' ? 'hsla(360, 53%, 41%, 1)' : 'hsla(0, 89%, 70%, 1)',
                dark: mode === 'light' ? 'hsla(360, 43%, 30%, 1)' : 'hsla(0, 63%, 23%, 1)',
            },
        },
        typography: {
            fontFamily: `"Poppins", "sans-serif"`,
        },
    }, {
        colors: {
            background: mode === 'light' ? 'hsla(220, 27%, 98%, 1)' : 'hsla(220, 21%, 17%, 1)',
            main: mode === 'light' ? 'hsla(220, 20%, 22%, 1)' : 'hsla(220, 27%, 98%, 1)',
            secondary: mode === 'light' ? 'hsla(214, 13%, 43%, 1)' : 'hsla(207, 18%, 90%, 1)',
            tertiary: mode === 'light' ? '' : '',
        },
    });

    theme.typography.body1 = {
        fontSize: '14px',
        color: theme.colors.main,
        fontFamily: `"Poppins", "sans-serif"`,
    };

    theme.typography.body2 = {
        fontSize: '12px',
        color: theme.colors.secondary,
        fontFamily: `"Poppins", "sans-serif"`,
    };

    theme.typography.h3 = {
        fontSize: '36px',
        fontWeight: 700,
        fontFamily: `"Poppins", "sans-serif"`,
    };

    theme.typography.h5 = {
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: `"Poppins", "sans-serif"`,
    };

    theme.typography.h6 = {
        fontSize: '16px',
        fontWeight: 500,
        fontFamily: `"Poppins", "sans-serif"`,
    };

    return theme;
};

export const lightTheme = createThemeMode('light');
export const darkTheme = createThemeMode('dark');

export const invertTheme = (theme: PaletteMode) => {
    if (theme === 'light') {
        return 'dark';
    } else {
        return 'light';
    }
};

export const useAppTheme = () => {
    return useLocalStorage<PaletteMode>('theme', 'dark');
};
