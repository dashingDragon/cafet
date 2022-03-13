import { Google } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();

  const handleGoogleSignin = async () => {
    console.log("uwu");

    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      console.log("sign in");
      const res = await signInWithPopup(auth, provider);
      const credentials = GoogleAuthProvider.credentialFromResult(res);
      console.log(credentials);
      router.replace("/");
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="S'Beer Eck Logo" width="80%" />
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
