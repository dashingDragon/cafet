import { Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from '../pages/_app';

const LoadingScreen = () => {
    return (
        <Box sx={{
            position: 'relative',
            mt: '256px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            overflow: 'hidden',
        }}>
            <Box sx={{
                width: '128px',
                height: '128px',
                borderRadius: '50%',
                overflow: 'hidden',
            }}>
                <Image
                    loader={imageLoader}
                    src={'/logo_white.jpg'}
                    alt={'Success image'}
                    width={128}
                    height={128}
                />
            </Box>

            <Box sx= {{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '128px',
                height: '128px',
                transform: 'translate(-50%, -50%)',
            }}>
                <CircularProgress size="128px" />
            </Box>
        </Box>
    );
};

export default LoadingScreen;
