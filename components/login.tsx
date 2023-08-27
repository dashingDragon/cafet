import { Google } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { imageLoader } from '../pages/_app';

const Login = () => {
    const router = useRouter();

    const handleGoogleSignin = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        try {
            const res = await signInWithPopup(auth, provider);
            const credentials = GoogleAuthProvider.credentialFromResult(res);
            if (credentials) {
                router.replace('/');
            } else {
                alert('Invalid credentials');
            }
        } catch (error: any) {
            alert(`Error ${error.code}: ${error.message}`);
            console.warn(error);
        }
    };

    return (
        <Container maxWidth="md" disableGutters>
            <Box
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Box borderRadius='50%' overflow={'hidden'} height={'256px'} mb={8}>
                    <Image
                        loader={imageLoader}
                        src={'/logo_white.jpg'}
                        alt={'Success image'}
                        width={256}
                        height={256}
                    />
                </Box>
                <Button
                    onClick={handleGoogleSignin}
                    variant="contained"
                    sx={{ mt: 3, mb: 10 }}
                >
                    <Box display="flex" alignItems="center" textTransform="none">
                        <Typography mr={1}>Se connecter avec</Typography>
                        <Google />
                    </Box>
                </Button>
            </Box>
        </Container>
    );
};

export default Login;
