import { Add } from "@mui/icons-material";
import { Box, darken, Fab, TextField } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAccountList, useStaffUser } from "../lib/firestoreHooks";
import AccountEditDialog from "./accountEditDialog";

const AccountList = () => {
  const router = useRouter();
  const staff = useStaffUser();
  const allRows = useAccountList();
  const [rows, setRows] = useState(allRows);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    handleSearch(query);
  }, [allRows]);

  const columns: GridColDef[] = [
    { field: "firstName", headerName: "Prénom", resizable: false, sortable: false, flex: 1 },
    { field: "lastName", headerName: "Nom", resizable: false, sortable: false, flex: 1 },
    { field: "isMember", headerName: "Membre?", type: "boolean", resizable: false, sortable: false, flex: 0.5 },
    {
      field: "balance",
      headerName: "Solde",
      resizable: false,
      sortable: false,
      flex: 0.5,
      valueFormatter: (params) => (params.value as number / 100).toFixed(2) + "€",
    },
  ];

  const handleSearch = (q: string) => {
    setQuery(q);
    const keywords = q.toLowerCase().split(" ").filter((k) => k.length > 0);

    const filtered = allRows
      .filter(({ firstName, lastName }) => keywords
        .every((keyword) => firstName.toLowerCase().includes(keyword) || lastName.toLowerCase().includes(keyword)));

    setRows(filtered);
  };

  return (
    <Box position="relative" flexGrow="1" overflow="hidden">
      <Box m={1}>
        <TextField
          value={query}
          onChange={(e) => handleSearch(e.target.value ?? "")}
          placeholder="Chercher"
          variant="standard"
          fullWidth
        />
      </Box>

      <DataGridPro
        columns={columns}
        rows={rows}
        initialState={{
          sorting: {
            sortModel: [
              { field: "firstName", sort: "asc" },
              { field: "lastName", sort: "asc" },
            ],
          },
        }}
        onCellClick={(p) => router.push(`/accounts/${p.id}`)}
        hideFooter
        disableColumnMenu
        rowHeight={40}
        getRowClassName={(a) => a.row.balance <= 0 ? "sbeereck-poor" : ""}
        sx={{
          border: 0,
          // Yes I'm cheating
          "& .MuiDataGrid-main > div:nth-child(3)": {
            display: "none",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .sbeereck-poor": {
            bgcolor: (theme) => darken(theme.palette.error.main, 0.4),
            "&:hover": {
              bgcolor: (theme) => darken(theme.palette.error.dark, 0.4),
            },
          },
        }}
      />

      {staff?.isAdmin &&
        <Fab
          onClick={() => setCreateAccountDialogOpen(true)}
          color="primary"
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      }

      <AccountEditDialog
        account={null}
        open={createAccountDialogOpen}
        onClose={() => setCreateAccountDialogOpen(false)}
        onSubmit={(a, b, c) => console.log(a, b, c)}
      />
    </Box>
  );
};

export default AccountList;
