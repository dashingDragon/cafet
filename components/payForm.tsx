import { ChevronRight, LocalBar, SportsBar } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Account } from "../lib/accounts";
import { BeerType } from "../lib/beers";
import { useBeers, useComputeTotal, usePayTransactionMaker } from "../lib/firestoreHooks";

const formatMoney = (money: number) => (money / 100).toFixed(2) + "€";

const InputBeer: React.FC<{
  selectedBeer: string | null,
  onSelectBeer: (id: string | null) => void,
}> = ({ selectedBeer, onSelectBeer }) => {
  const beerWithTypes = useBeers();

  return (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>Choisissez une Bière</Typography>
      <ToggleButtonGroup
        value={selectedBeer}
        onChange={(_, id) => onSelectBeer(id)}
        exclusive
        orientation="vertical"
        color="info"
        size="large"
        fullWidth
      >
        {beerWithTypes.filter(({ beer }) => beer.isAvailable).map(({ beer, type }) => (
          <ToggleButton key={beer.id} value={beer.id} sx={{ textTransform: "none" }}>
            <Box width="100%" display="flex" m={1}>
              {beer.image !== undefined
                ? <Avatar src={beer.image} />
                : <Avatar>{beer.name[0]}</Avatar>
              }
              <Box ml={2} display="flex" flexDirection="column" justifyContent="center" alignItems="start">
                <Typography variant="body1" sx={{ mb: 1 }}>{beer.name}</Typography>
                <Chip label={`${type.name} ${formatMoney(type.price)}`} />
              </Box>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};

const InputBeerAddon: React.FC<{
  type: BeerType,
  selectedAddons: number[],
  onSelectAddon: (id: number) => void,
}> = ({ type, selectedAddons, onSelectAddon }) => {
  const isSelected = (id: number) => selectedAddons.includes(id);

  return (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>Choisissez un supplément (optionnel)</Typography>
      {type.addons.map(({ name, price }, i) => (
        <Chip
          key={i}
          onClick={() => onSelectAddon(i)}
          label={`${name} +${formatMoney(price)}`}
          color={isSelected(i) ? "primary" : undefined}
        />
      ))}
    </>
  );
};

const InputQuantity: React.FC<{
  quantity: number,
  onSelectQuantity: (amount: number | null) => void,
}> = ({ quantity, onSelectQuantity }) => {
  const buttons = [
    {
      value: 1,
      label: "Demi (25cl)",
      icon: <LocalBar sx={{ width: 64, height: 64 }} />,
    },
    {
      value: 2,
      label: "Pinte (1/2 L)",
      icon: <SportsBar sx={{ width: 64, height: 64 }} />,
    },
  ] as const;

  return (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>Choisissez une quantité</Typography>
      <ToggleButtonGroup
        value={quantity}
        onChange={(_, qty) => onSelectQuantity(qty)}
        exclusive
        fullWidth
        color="info"
      >
        {buttons.map(({ value, label, icon }, i) => (
          <ToggleButton
            key={i}
            value={value}
            sx={{ textTransform: "none" }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              {icon}
              <Typography variant="body2">{label}</Typography>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};

const PayForm: React.FC<{ account: Account }> = ({ account }) => {
  const router = useRouter();
  const beerWithTypes = useBeers();
  const makePayTransaction = usePayTransactionMaker();

  // State
  const [selectedBeer, setSelectedBeer] = useState(null as string | null);
  const [selectedAddons, setSelectedAddons] = useState([] as number[]);
  const [quantity, setQuantity] = useState(1);

  // Getters
  const getSelectedBeer = () => {
    return beerWithTypes.find(({ beer: {id} }) => id === selectedBeer);
  };
  const total = useComputeTotal(getSelectedBeer(), selectedAddons, quantity);

  // Handlers
  const handleSelectBeer = (id: string | null) => {
    // Something need to always be selected
    if (id === null) {
      return;
    }

    setSelectedAddons([]);
    setSelectedBeer(id);
  };

  const handleSelectAddon = (id: number) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((tId) => tId !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleSetQuantity = (qty: number | null) => {
    if (qty === null) {
      return;
    }
    setQuantity(qty);
  };

  // Compute money stuff
  const canBeCompleted = () => {
    return (getSelectedBeer()?.beer.isAvailable ?? false) && total <= account.balance;
  };

  const handlePay = async () => {
    const beer = getSelectedBeer();
    if (!beer) return alert("Wow tu te calme");

    await makePayTransaction(account, beer, selectedAddons, quantity);
    router.push(`/accounts/${account.id}`);
  };

  return (
    <>
      <Box m={1}>
        <InputBeer selectedBeer={selectedBeer} onSelectBeer={handleSelectBeer} />
      </Box>
      {selectedBeer !== null && getSelectedBeer()!.type.addons.length > 0 &&
        <Box m={1}>
          <InputBeerAddon type={getSelectedBeer()!.type} selectedAddons={selectedAddons} onSelectAddon={handleSelectAddon} />
        </Box>
      }
      <Box m={1}>
        <InputQuantity quantity={quantity} onSelectQuantity={handleSetQuantity} />
      </Box>
      <Box m={1}>
        <Button
          disabled={!canBeCompleted()}
          onClick={handlePay}
          color="info"
          variant="contained"
          fullWidth
          sx={{ textTransform: "none" }}
        >
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Total: {formatMoney(total)}</Typography>
            <ChevronRight fontSize="large" />
          </Box>
        </Button>
      </Box>
    </>
  );
};

export default PayForm;
