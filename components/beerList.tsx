import { Avatar, Box, Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import React, { useState } from "react";
import { Beer, BeerType, BeerWithType } from "../lib/beers";

const beers: Beer[] = [
  {
    id: "1",
    name: "BDN",
    isAvailable: true,
    image: "/beers/bdn.png",
    typeId: "1",
  },
  {
    id: "2",
    name: "Chouffe",
    isAvailable: false,
    image: "/beers/chouffe.png",
    typeId: "2",
  },
];

const types: BeerType[] = [
  {
    id: "1",
    name: "Normal",
    price: 120,
    addons: [],
  },
  {
    id: "2",
    name: "Spécial",
    price: 165,
    addons: [{ id: "1", name: "Picon", price: 100 }],
  },
];

const beerWithTypes: BeerWithType[] = [
  { beer: beers[0], type: types[0] },
  { beer: beers[1], type: types[1] },
];

const BeerItem: React.FC<{ beer: Beer, type: BeerType }> = ({ beer, type }) => {
  const [availableDialogOpen, setAvailableDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setAvailableDialogOpen(true)}
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
          <Button onClick={() => setAvailableDialogOpen(false)}>Oui</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BeerList = () => {
  return (
    <Box m={1}>
      {beerWithTypes.map(({ beer, type }) =>
        <Box key={beer.id} mb={1}>
          <BeerItem beer={beer} type={type} />
        </Box>
      )}
    </Box>
  );
};

export default BeerList;
