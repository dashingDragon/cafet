import { GroupAdd, Savings, SportsBar } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React from "react";
import { MEMBERSHIP_PRICE } from "../lib/accounts";
import { SbeereckEvent } from "../lib/event";
import { useCurrentEventStats, useCurrentEventStatsForBeers } from "../lib/firestoreHooks";

const formatMoney = (n: number) => (n / 100).toFixed(2) + " €";
const formatQuantity = (q: number) => (q / 4).toFixed(2) + " L";

const StatsEvent: React.FC<{ event: SbeereckEvent }> = ({ event }) => {
  const [memberships, recharges, drinks, quantity] = useCurrentEventStats();
  const beerStats = useCurrentEventStatsForBeers();

  const totalMoney = memberships * MEMBERSHIP_PRICE + drinks;

  return (
    <>
      <Card sx={{ m: 2 }}>
        <CardHeader title="Stats globales" />
        <CardContent>
          <Box display="flex" justifyContent="space-around">

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <Savings />
                <Typography variant="h5">&nbsp;{formatMoney(totalMoney)}</Typography>
              </Box>
              <Typography>Total de l&apos;event</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <SportsBar />
                <Typography variant="h5">&nbsp;{formatQuantity(quantity)}</Typography>
              </Box>
              <Typography>Bu au total</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" alignItems="center">
                <GroupAdd />
                <Typography variant="h5">&nbsp;+{memberships}</Typography>
              </Box>
              <Typography>Membres</Typography>
            </Box>

          </Box>
        </CardContent>
      </Card>

      <Card sx={{ m: 2 }}>
        <CardHeader title="Stats par bière" />
        <CardContent>
          {"Promis je fais un truc joli un jour"}
          <List>
            {beerStats.map(({beer, quantity, money}) => (
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
            ))}
          </List>
        </CardContent>
      </Card>
    </>
  );
};

export default StatsEvent;
