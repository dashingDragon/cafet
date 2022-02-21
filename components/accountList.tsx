import { Box, darken, TextField } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useRouter } from "next/router";

const AccountList = () => {
  const router = useRouter();

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
      valueFormatter: (params) => (params.value as number / 100).toLocaleString() + "€",
    },
  ];

  // TODO: real data
  const rows = Array(400).fill(0).map((_, i) => ({
    id: i,
    firstName: "John",
    lastName: "Doe",
    isMember: Math.random() > 0.2,
    balance: Math.round((Math.random() -0.2) * 2000),
  }));

  return (
    <>
      <Box sx={{ m: "1em" }}>
        <TextField placeholder="Chercher" fullWidth variant="standard" />
      </Box>

      <DataGridPro
        columns={columns}
        rows={rows}
        initialState={{
          sorting: {
            sortModel: [
              { field: "firstName", sort: "desc" },
              { field: "lastName", sort: "desc" },
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
    </>
  );
};

export default AccountList;
