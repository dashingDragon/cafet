import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import { createTheme, PaletteMode, responsiveFontSizes } from "@mui/material";
import useLocalStorage from "@rehooks/local-storage";
import { ResponsiveFontSizesOptions } from "@mui/material/styles/responsiveFontSizes";
import { Typography } from "@mui/material/styles/createTypography";

const createThemeMode = (mode: PaletteMode) => {
  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  theme.typography.body1 = {
    fontSize: "14px",
    [theme.breakpoints.up("sm")]: {
      fontSize: "12px",
    },
  };

  return theme;
};

export const lightTheme = createThemeMode("light");
export const darkTheme = createThemeMode("dark");

export const invertTheme = (theme: PaletteMode) => {
  if (theme === "light") {
    return "dark";
  } else {
    return "light";
  }
};

export const useAppTheme = () => {
  return useLocalStorage<PaletteMode>("theme", "dark");
};
