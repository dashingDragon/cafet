import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import { createTheme, PaletteMode } from "@mui/material";
import useLocalStorage from "@rehooks/local-storage";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

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
