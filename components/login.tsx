import { Google } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";

const Login = () => {
  return (
    <Container maxWidth="md" disableGutters>
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <img
          src="logo.png"
          width="80%"
        />
        <Button variant="contained" sx={{ mt: 3, mb: 10 }}>
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
