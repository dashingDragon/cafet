import { GroupAdd, Savings, LunchDining, EmojiFoodBeverage, Coffee, Cookie, Euro } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useCurrentStats } from "../lib/firestoreHooks";

const formatMoney = (n: number) => (n / 100).toFixed(2) + " €";
const formatProductsQuantity = (q: number) => (q / 4).toFixed(2) + " kg";
const formatDrinksQuantity = (q: number) => (q / 4).toFixed(2) + " L";

const Stats: React.FC = () => {
  const [totalProfits, servingsProfits, drinksProfits, snacksProfits] = useCurrentStats();

  return (
    <>
      <Card sx={{ m: 2 }}>
        <CardHeader title="Statistiques globales" />
        <CardContent>
          <Box display="flex" justifyContent="space-around">

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <Euro />
                <Typography variant="h5">&nbsp;{formatMoney(totalProfits)}</Typography>
              </Box>
              <Typography>Total</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <LunchDining />
                <Typography variant="h5">&nbsp;{formatMoney(servingsProfits)}</Typography>
              </Box>
              <Typography>Sous-total des plats</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <Coffee />
                <Typography variant="h5">&nbsp;{formatMoney(drinksProfits)}</Typography>
              </Box>
              <Typography>Sous-total des boissons</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <Cookie />
                <Typography variant="h5">&nbsp;{formatMoney(snacksProfits)}</Typography>
              </Box>
              <Typography>Sous-total des snacks</Typography>
            </Box>

          </Box>
        </CardContent>
      </Card>

      <Card sx={{ m: 2 }}>
        <CardHeader title="Stats" />
        <CardContent>
          <List>
            {/* {stats.map(({recharges, drinks, drinksQuantity, products, productsQuantity}) => (
              <ListItem key={beer.id} disablePadding>
                <ListItemAvatar>
                  {beer.image !== undefined
                    ? <Avatar src={beer.image} sx={{ mr: 1 }} />
                    : <Avatar sx={{ mr: 1 }}>{beer.name[0]}</Avatar>
                  }
                </ListItemAvatar>
                <ListItemText
                  primary={beer.name}
                  secondary={`Bu: ${formatQuantity(quantity)} || Vendu: ${formatMoney(money)}`}
                />
              </ListItem>
            ))} */}
          </List>
        </CardContent>
      </Card>
    </>
  );
};

export default Stats;
