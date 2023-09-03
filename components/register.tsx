import { Box, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
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

    const [missingFirstName, setMissingFirstName] = useState(false);
    const [missingLastName, setMissingLastName] = useState(false);

    const handleSignUp = async () => {
        setSubmitting(true);

        if (!firstName || !lastName) {
            setMissingFirstName(!firstName);
            setMissingLastName(!lastName);
            setSubmitting(false);
        } else {
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
        }
    };

    return (
        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            width='100%'
            maxWidth={420}
            alignSelf={'center'}
        >
            <Typography variant='h3' mb={4}>
                    Bienvenue à la Cafet !
            </Typography>

            {/* Logo */}
            <Box borderRadius='50%' overflow={'hidden'} height={'256px'} mb={8}>
                <Image
                    loader={imageLoader}
                    src={'/logo_white.jpg'}
                    alt={'Logo'}
                    width={256}
                    height={256}
                />
            </Box>

            <Typography variant='h6' mb={4}>
                Créez votre compte pour commander
            </Typography>

            {/* First name */}
            <TextField
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
                error={missingFirstName}
                label='Prénom'
                variant="outlined"
                fullWidth
                sx={{ my: 1 }}
            />

            {/* Second Name */}
            <TextField
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
                error={missingLastName}
                label="Nom"
                variant="outlined"
                fullWidth
                sx={{ my: 1 }}
            />

            {/* School */}
            <FormControl fullWidth sx={{ my: 1 }}>
                <InputLabel>École</InputLabel>
                <Select
                    value={school}
                    onChange={(e) => setSchool(e.target.value as School)}
                    disabled={submitting}
                    label="Ecole"
                    variant="outlined"
                >
                    {allSchools.map(({ value, name }) => (
                        <MenuItem key={value} value={value}>{name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Phone number */}
            <TextField
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                label="Numéro de téléphone"
                variant="outlined"
                fullWidth
                sx={{ my: 1 }}
            />

            {/* Email address */}
            <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                label="Adresse mail"
                variant="outlined"
                fullWidth
                sx={{ my: 1 }}
            />

            {/* Create button */}
            <Button
                onClick={handleSignUp}
                variant="contained"
                sx={{ mt: 3, borderRadius: '20px', width: '170px' }}
                disabled={submitting}
            >
                {submitting ? (
                    <CircularProgress sx={{ color: 'white' }} size='24.5px' />
                ) : 'Créer mon compte'}
            </Button>

        </Stack>
    );
};

export default Register;
