import { ChevronRight, LocalBar, SportsBar } from "@mui/icons-material";
import { Avatar, Box, Button, ButtonGroup, Chip, FabPropsVariantOverrides, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { Account } from "../lib/accounts";
import { Beer, BeerType, BeerWithType } from "../lib/beers";
import { useBeers } from "../lib/firestoreHooks";

const formatMoney = (money: number) => (money / 100).toFixed(2) + "€";

type BeerButtonProps = {
  selectedBeer: string | null,
  onSelectBeer: (id: string | null) => void,
};

const InputBeer = ({ selectedBeer, onSelectBeer }: BeerButtonProps) => {
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

type InputBeerAddonProps = {
  type: BeerType,
  selectedAddons: string[],
  onSelectAddon: (id: string) => void,
};

const InputBeerAddon = ({ type, selectedAddons, onSelectAddon }: InputBeerAddonProps) => {
  const isSelected = (id: string) => selectedAddons.includes(id);
  return (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>Choisissez un supplément (optionnel)</Typography>
      {type.addons.map(({ id, name, price }) => (
        <Chip
          key={id}
          onClick={() => onSelectAddon(id)}
          label={`${name} +${formatMoney(price)}`}
          color={isSelected(id) ? "primary" : undefined}
        />
      ))}
    </>
  );
};

type InputQuantityProps = {
  quantity: number,
  onSelectQuantity: (amount: number | null) => void,
};

const InputQuantity = ({ quantity, onSelectQuantity }: InputQuantityProps) => {
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

type PayFormProps = {
  account: Account,
};

const PayForm = ({ account }: PayFormProps) => {
  const router = useRouter();
  const beerWithTypes = useBeers();

  // State
  const [selectedBeer, setSelectedBeer] = useState(null as string | null);
  const [selectedAddons, setSelectedAddons] = useState([] as string[]);
  const [quantity, setQuantity] = useState(1);

  // Getters
  const getSelectedBeer = () => {
    return beers.find(({ id }) => id === selectedBeer);
  };
  const getSelectedType = () => {
    if (selectedBeer === null) {
      return null;
    }
    const typeId = getSelectedBeer()!.typeId;
    return types.find(({ id }) => id === typeId);
  };

  // Handlers
  const handleSelectBeer = (id: string | null) => {
    // Something need to always be selected
    if (id === null) {
      return;
    }

    setSelectedAddons([]);
    setSelectedBeer(id);
  };

  const handleSelectAddon = (id: string) => {
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
    return (getSelectedBeer()?.isAvailable ?? false) && computeTotal() <= account.balance;
  };
  const computeTotal = () => {
    const beer = getSelectedBeer();
    const type = getSelectedType();

    const baseBeer = type?.price ?? 0;
    const addons = beer === null ? 0 : selectedAddons
      .map((aId) => type!.addons.find(({ id }) => aId === id)!)
      .reduce((acc, { price }) => acc + price, 0);

    return baseBeer * quantity + addons;
  };

  return (
    <>
      <Box m={1}>
        <InputBeer selectedBeer={selectedBeer} onSelectBeer={handleSelectBeer} />
      </Box>
      {selectedBeer !== null && getSelectedType()!.addons.length > 0 &&
        <Box m={1}>
          <InputBeerAddon type={getSelectedType()!} selectedAddons={selectedAddons} onSelectAddon={handleSelectAddon} />
        </Box>
      }
      <Box m={1}>
        <InputQuantity quantity={quantity} onSelectQuantity={handleSetQuantity} />
      </Box>
      <Box m={1}>
        <Button
          disabled={!canBeCompleted()}
          onClick={() => router.push(`/accounts/${account.id}`)}
          color="info"
          variant="contained"
          fullWidth
          sx={{ textTransform: "none" }}
        >
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Total: {formatMoney(computeTotal())}</Typography>
            <ChevronRight fontSize="large" />
          </Box>
        </Button>
      </Box>
    </>
  );
};

export default PayForm;
