import { Alert, AlertColor, Box, Slide, SlideProps, Snackbar, Stack, SxProps, Theme } from '@mui/material';
import { ReactElement, createContext, useState } from 'react';

type TransitionProps = Omit<SlideProps, 'direction'>;

const TransitionRight = (props: TransitionProps) => {
    return <Slide {...props} direction="right" />;
};

export const SnackbarContext = createContext<(message: string, severity: AlertColor) => void>(() => {return;});

export const FullHeightScrollableContainer: React.FC<{
  children: ReactElement,
  sx?: SxProps<Theme>,
}> = ({ sx, children }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');

    const setSnackbarMessage = (message: string, severity: AlertColor) => {
        setMessage(message);
        setSeverity(severity);
        setSnackbarOpen(true);
    };

    return (
        <SnackbarContext.Provider value={setSnackbarMessage}>
            <Stack
                flexGrow={1}
                direction="column"
                p={4}
                pb={12}
                width='100%'
                maxWidth='900px'
                overflow="auto"
                sx={sx}>
                {children}
            </Stack>
            <Snackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                TransitionComponent={TransitionRight}
                key={'transition'}
                autoHideDuration={6000}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={severity} sx={{ width: '100%' }} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

export default FullHeightScrollableContainer;