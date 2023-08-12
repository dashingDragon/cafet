import { Add } from '@mui/icons-material';
import { Box, Fab, TextField, darken } from '@mui/material';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccountList, useAccountMaker } from '../lib/firestoreHooks';
import AccountEditDialog from './accountEditDialog';
import { School } from '../lib/accounts';

const AccountList = () => {
    const router = useRouter();
    const allRows = useAccountList();
    const accountMaker = useAccountMaker();
    const [rows, setRows] = useState(allRows);
    const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        handleSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRows]);

    const columns: GridColDef[] = [
        { field: 'firstName', headerName: 'Prénom', resizable: false, sortable: false, flex: 1 },
        { field: 'lastName', headerName: 'Nom', resizable: false, sortable: false, flex: 1 },
        {
            field: 'balance',
            headerName: 'Solde',
            resizable: false,
            sortable: false,
            flex: 0.5,
            valueFormatter: (params) => (params.value as number / 100).toFixed(2) + '€',
        },
    ];

    const handleSearch = (q: string) => {
        setQuery(q);
        const keywords = q.toLowerCase().split(' ').filter((k) => k.length > 0);

        const filtered = allRows
            .filter(({ firstName, lastName }) => keywords
                .every((keyword) => firstName.toLowerCase().includes(keyword) || lastName.toLowerCase().includes(keyword)));

        setRows(filtered);
    };

    const handleAddAccount = async (firstName: string, lastName: string, school: School) => {
        try {
            setCreateAccountDialogOpen(false);
            const id = (await accountMaker(firstName, lastName, school)).id;
            router.push(`accounts/${id}`);
        } catch (e: any) {
            alert(`Something wrong happened: ${e}`);
        }
    };

    return (
        <Box position="relative" flexGrow="1" overflow="hidden">
            <Box m={1}>
                <TextField
                    value={query}
                    onChange={(e) => handleSearch(e.target.value ?? '')}
                    placeholder="Chercher"
                    variant="standard"
                    fullWidth
                    sx={{
                        '.MuiInput-input': {
                            height: '2em',
                        },
                    }}
                />
            </Box>

            <DataGridPro
                columns={columns}
                rows={rows}
                initialState={{
                    sorting: {
                        sortModel: [
                            { field: 'firstName', sort: 'asc' },
                            { field: 'lastName', sort: 'asc' },
                        ],
                    },
                }}
                onCellClick={(p) => router.push(`/accounts/${p.id}`)}
                hideFooter
                disableColumnMenu
                rowHeight={40}
                getRowClassName={(a) => a.row.balance <= 0 ? 'bankrupt' : ''}
                sx={{
                    border: 0,
                    // Yes I'm cheating
                    ...(!!rows.length ? {
                        '& .MuiDataGrid-main > div:nth-child(3)': {
                            display: 'none',
                        },
                    } : {
                        '& .MuiDataGrid-main > div:nth-child(4)': {
                            display: 'none',
                        },
                    }),

                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .bankrupt': {
                        color: 'white',
                        bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.error.main : theme.palette.error.main,
                        '&:hover': {
                            bgcolor: (theme) => darken(theme.palette.error.main, 0.2),
                        },
                        '* > .MuiSvgIcon-root': {
                            color: 'white',
                        },
                    },
                }}
            />

            <Fab
                onClick={() => setCreateAccountDialogOpen(true)}
                color="primary"
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                }}
            >
                <Add />
            </Fab>

            <AccountEditDialog
                account={null}
                open={createAccountDialogOpen}
                onClose={() => setCreateAccountDialogOpen(false)}
                onSubmit={handleAddAccount}
            />
        </Box>
    );
};

export default AccountList;
