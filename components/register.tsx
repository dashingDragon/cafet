import { Box, Button, Container, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { MakeAccountPayload, School, allSchools } from '../lib/accounts';
import { useMakeAccount } from '../lib/firebaseFunctionHooks';
import { useState } from 'react';

const Register: React.FC = () => {
    const router = useRouter();
    const makeAccount = useMakeAccount();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [school, setSchool] = useState(School.Unknown);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSignUp = async () => {
        setSubmitting(true);
        const payload = {
            firstName: firstName,
            lastName: lastName,
            school: school,
            phone: phone,
            email: email,
        } as MakeAccountPayload;
        const result = await makeAccount(payload);
        if (result.data.success) {
            // TODO snackbar
            router.replace('/');
        } else {
            console.error('An error occured. Please try again.');
        }
        setSubmitting(false);
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
                <TextField
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={submitting}
                    placeholder="Prénom"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
                <TextField
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={submitting}
                    placeholder="Nom"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
                <FormControl fullWidth sx={{ my: 1 }}>
                    <Select
                        value={school}
                        onChange={(e) => setSchool(e.target.value as School)}
                        disabled={submitting}
                        label="Ecole"
                        placeholder="Ecole"
                        variant="standard"
                    >
                        {allSchools.map(({ value, name }) => (
                            <MenuItem key={value} value={value}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    placeholder="Numéro de téléphone"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
                <TextField
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    placeholder="Email"
                    variant="standard"
                    fullWidth
                    sx={{ my: 1 }}
                />
                <Button
                    onClick={handleSignUp}
                    variant="contained"
                    sx={{ mt: 3, mb: 10 }}
                >
                    Créer un compte
                </Button>
            </Box>
        </Container>
    );
};

export default Register;
