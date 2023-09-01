import { Box, Stack, SxProps, Theme } from '@mui/material';
import { ReactElement } from 'react';

export const FullHeightScrollableContainer: React.FC<{
  children: ReactElement,
  sx?: SxProps<Theme>,
}> = ({ sx, children }) => {
    return (
        <Stack
            flexGrow={1}
            direction="column"
            p={4}
            width='100%'
            maxWidth='900px'
            overflow="auto"
            sx={sx}>
            {children}
        </Stack>
    );
};

export default FullHeightScrollableContainer;