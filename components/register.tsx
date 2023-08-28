import { Box, Button, Container, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { MakeAccountPayload, School, allSchools } from '../lib/accounts';
import { useMakeAccount } from '../lib/firebaseFunctionHooks';
import { useState } from 'react';
import Image from 'next/image';
import { imageLoader } from '../pages/_app';

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

    // TODO require some input validation
    return (
        <Container maxWidth="md" disableGutters>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                m={4}
            >
                <Typography variant='h3'>
                    Bienvenue à la Cafet !
                </Typography>
                <Box borderRadius='50%' overflow={'hidden'} height={'256px'} mb={8}>
                    <Image
                        loader={imageLoader}
                        src={'/logo_white.jpg'}
                        alt={'Success image'}
                        width={256}
                        height={256}
                    />
                </Box>

                <Typography variant='h6'>
                    Créez votre compte pour commander
                </Typography>
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
                    sx={{ mt: 3 }}
                    disabled={submitting}
                >
                    Créer mon compte
                </Button>
            </Box>
        </Container>
    );
};

export default Register;
