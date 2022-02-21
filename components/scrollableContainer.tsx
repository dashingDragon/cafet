import { Box } from "@mui/material";
import { ReactElement } from "react";

type ScrollableContainerProps = {
    children: ReactElement,
};

export const FullHeightScrollableContainer = ({ children }: ScrollableContainerProps) => {
  return (
    <Box sx={{
      flexGrow: 1,
      maxHeight: "100%",
      overflow: "auto",
    }}>
      {children}
    </Box>
  );
};

export default FullHeightScrollableContainer;
