import { Box, SxProps, Theme } from '@mui/material';
import { ReactElement } from 'react';

export const FullHeightScrollableContainer: React.FC<{
  children: ReactElement,
  sx?: SxProps<Theme>,
}> = ({ sx, children }) => {
    return (
        <Box
            flexGrow={1}
            maxHeight="100%"
            overflow="auto"
            sx={sx}>
            {children}
        </Box>
    );
};

export default FullHeightScrollableContainer;
