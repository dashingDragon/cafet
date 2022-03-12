import { Avatar, Box, Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import React, { useState } from "react";
import { Beer, BeerType, BeerWithType } from "../lib/beers";
import { useSetBeerAvailability, useStaffUser } from "../lib/firestoreHooks";

const BeerItem: React.FC<{ beer: Beer, type: BeerType }> = ({ beer, type }) => {
  const staff = useStaffUser();
  const setBeerAvailability = useSetBeerAvailability();
  const [availableDialogOpen, setAvailableDialogOpen] = useState(false);

  const handleChangeAvailability = async () => {
    setAvailableDialogOpen(false);
    await setBeerAvailability(beer, !beer.isAvailable);
  };

  return (
    <>
      <Button
        onClick={staff?.isAdmin ? () => setAvailableDialogOpen(true) : () => {}}
        variant="contained"
        color={beer.isAvailable ? "success" : "warning"}
        fullWidth
        sx={{ textTransform: "none" }}
      >
        <Box display="flex" alignItems="center" width="100%">
          {beer.image !== undefined
            ? <Avatar src={beer.image} sx={{ mr: 1 }} />
            : <Avatar sx={{ mr: 1 }}>{beer.name[0]}</Avatar>
          }
          <Box display="flex" flexDirection="column" sx={{ textAlign: "start" }}>
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{ textDecorationLine: beer.isAvailable ? "none" : "line-through" }}
            >
              {beer.name}
            </Typography>
            <Typography variant="body2">{type.name}</Typography>
          </Box>
        </Box>
      </Button>

      {/* Change availability dialog */}
      <Dialog open={availableDialogOpen} onClose={() => setAvailableDialogOpen(false)}>
        <DialogTitle>
          {beer.isAvailable ? "Rendre non disponible ?" : "Render disponible ?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setAvailableDialogOpen(false)}>Non</Button>
          <Button onClick={handleChangeAvailability}>Oui</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BeerList: React.FC<{
  beers: BeerWithType[],
}> = ({ beers }) => {
  return (
    <Box m={1}>
      {beers.map(({ beer, type }) =>
        <Box key={beer.id} mb={1}>
          <BeerItem beer={beer} type={type} />
        </Box>
      )}
    </Box>
  );
};

export default BeerList;
