import { Avatar, Box, Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import React, { useState } from "react";
import { Staff } from "../lib/staffs";

const staffs: Staff[] = [
  {
    id: "1",
    name: "Lucas Malandrino",
    isAvailable: true,
    isAdmin: true,
    tel: "1",
  },
  {
    id: "2",
    name: "Valentin barbaza",
    isAvailable: false,
    isAdmin: true,
    tel: "1",
  },
];

const StaffItem: React.FC<{ staff: Staff }> = ({ staff }) => {
  const [availableDialogOpen, setAvailableDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setAvailableDialogOpen(true)}
        variant="contained"
        color={staff.isAvailable ? "success" : "warning"}
        fullWidth
        sx={{ textTransform: "none" }}
      >
        <Box display="flex" alignItems="center" width="100%">
          <Avatar sx={{ mr: 1 }}>{staff.name.split(" ").map(p => p[0].toUpperCase()).join("")}</Avatar>
          <Typography
            variant="body1"
            fontWeight="bold"
          >
            {staff.name}
          </Typography>
        </Box>
      </Button>

      {/* Change availability dialog */}
      <Dialog open={availableDialogOpen} onClose={() => setAvailableDialogOpen(false)}>
        <DialogTitle>
          {staff.isAvailable ? "Rendre non disponible ?" : "Render disponible ?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setAvailableDialogOpen(false)}>Non</Button>
          <Button onClick={() => setAvailableDialogOpen(false)}>Oui</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const StaffList = () => {
  return (
    <Box m={1}>
      {staffs.map((staff) =>
        <Box key={staff.id} mb={1}>
          <StaffItem staff={staff} />
        </Box>
      )}
    </Box>
  );
};

export default StaffList;
