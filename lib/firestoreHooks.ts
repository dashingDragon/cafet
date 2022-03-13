import { getFirestore, collection, query, orderBy, onSnapshot, doc, writeBatch, limit, addDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Account, accountConverter, MEMBERSHIP_PRICE, School } from "./accounts";
import { useUser } from "./hooks";
import { Staff, staffConverter } from "./staffs";
import { transactionConverter, TransactionDrink, TransactionRecharge, TransactionType } from "./transactions";
import { eventConverter, SbeereckEvent } from "./event";
import { Beer, beerConverter, BeerType, beerTypeConverter, BeerWithType } from "./beers";

export const useStaffUser = () => {
  const db = getFirestore();
  const user = useUser();
  const [staffUser, setStaffUser] = useState(undefined as Staff | undefined);

  useEffect(() => {
    const q = doc(db, `staffs/${user?.uid}`).withConverter(staffConverter);
    return onSnapshot(q, (snapshot) => {
      const staff = snapshot.data();
      if (!staff) {
        alert("Failed to query staff !");
      } else {
        setStaffUser(staff);
      }
    });
  }, [db, user]);

  return staffUser;
};

export const useStaffs = () => {
  const db = getFirestore();
  const user = useStaffUser();
  const [staffs, setStaffs] = useState([] as Staff[]);

  useEffect(() => {
    const q = collection(db, "staffs").withConverter(staffConverter);
    return onSnapshot(q, (snapshot) => {
      const staffs = snapshot.docs.map((a) => a.data());

      setStaffs(staffs);
    });
  }, [db, user]);

  return staffs;
};

export const useSetStaffAvailability = () => {
  const db = getFirestore();
  const user = useStaffUser();

  if (!user) return () => alert("Not connected !");

  if (!user.isAdmin) return () => alert("Vous n'avez pas les permissions !");

  return async (staff: Staff, isAvailable: boolean) => {
    await updateDoc(doc(db, `staffs/${staff.id}`).withConverter(staffConverter), {
      isAvailable,
    });
  };
};

export const useCurrentEvent = () => {
  const db = getFirestore();
  const user = useUser();
  const [currentEvent, setCurrentEvent] = useState(undefined as SbeereckEvent | undefined);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("created", "desc"), limit(1)).withConverter(eventConverter);
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((a) => a.data());
      if (events.length > 1) throw Error("wat");

      setCurrentEvent(events[0]);
    });
  }, [db, user]);

  return currentEvent;
};

export const useCurrentEventStatsForAccount = (account: Account) => {
  const db = getFirestore();
  const event = useCurrentEvent();

  const [quantityDrank, setQuantityDrank] = useState(0);
  const [moneyRecharged, setMoneyRecharged] = useState(0);
  const [moneyDrank, setMoneyDrank] = useState(0);

  useEffect(() => {
    if (!event) return;

    const transactionsDrink = query(
      collection(db, `events/${event.id}/transactions`),
      where("type", "==", TransactionType.Drink),
      where("customer", "==", doc(db, `accounts/${account.id}`)),
    ).withConverter(transactionConverter);

    return onSnapshot(transactionsDrink, (snapshot) => {
      const transactions = snapshot.docs.map((a) => a.data());
      setQuantityDrank(transactions.map((t) => (t as TransactionDrink).quantity).reduce((a, b) => a + b, 0));
      setMoneyDrank(transactions.map((t) => (t as TransactionDrink).price).reduce((a, b) => a + b, 0));
    });
  }, [db, account, event]);

  useEffect(() => {
    if (!event) return;

    const transactionsRecharge = query(
      collection(db, `events/${event.id}/transactions`),
      where("type", "==", TransactionType.Recharge),
      where("customer", "==", doc(db, `accounts/${account.id}`)),
    ).withConverter(transactionConverter);

    return onSnapshot(transactionsRecharge, (snapshot) => {
      const transactions = snapshot.docs.map((a) => a.data());
      setMoneyRecharged(transactions.map((t) => (t as TransactionRecharge).amount).reduce((a, b) => a + b, 0));
    });
  }, [db, account, event]);

  return [quantityDrank, moneyRecharged, moneyDrank];
};

export const useAccountList = () => {
  const db = getFirestore();
  const user = useUser();
  const [accounts, setAccounts] = useState([] as Account[]);

  useEffect(() => {
    const q = query(collection(db, "accounts"), orderBy("lastName", "asc"), orderBy("firstName", "asc")).withConverter(accountConverter);
    return onSnapshot(q, (snapshot) => {
      setAccounts(snapshot.docs.map((a) => a.data()));
    });
  }, [db, user]);

  return accounts;
};

export const useAccount = (id: string) => {
  const db = getFirestore();
  const user = useUser();
  const [account, setAccount] = useState(undefined as Account | undefined);

  useEffect(() => {
    const q = doc(db, `accounts/${id}`).withConverter(accountConverter);
    return onSnapshot(q, (snapshot) => {
      setAccount(snapshot.data());
    });
  }, [db, id, user]);

  return account;
};

export const useBeers = () => {
  const db = getFirestore();
  const user = useUser();
  const [beers, setBeers] = useState([] as Beer[]);
  const [types, setTypes] = useState([] as BeerType[]);
  const [beerWithTypes, setBeerWithTypes] = useState([] as BeerWithType[]);

  useEffect(() => {
    const q = collection(db, "beers").withConverter(beerConverter);
    return onSnapshot(q, (snapshot) => {
      setBeers(snapshot.docs.map((b) => b.data()));
    });
  }, [db, user]);

  useEffect(() => {
    const q = collection(db, "beerTypes").withConverter(beerTypeConverter);
    return onSnapshot(q, (snapshot) => {
      setTypes(snapshot.docs.map((t) => t.data()));
    });
  }, [db, user]);

  useEffect(() => {
    // Dont allow beers to show up if there type hasn't been fetched yet
    setBeerWithTypes(beers
      .filter((b) => types.find((t) => t.id === b.typeId))
      .map((b) => ({
        beer: b,
        type: types.find((t) => t.id === b.typeId)!,
      })));
  }, [beers, types]);

  return beerWithTypes;
};

export const useAccountMaker = () => {
  const db = getFirestore();

  return async (firstName: string, lastName: string, school: School) => {
    console.log(`Create account for ${firstName} ${lastName}, ${school}`);
    return await addDoc(collection(db, "accounts").withConverter(accountConverter), {
      id: "0",
      firstName,
      lastName,
      isMember: false,
      school,
      balance: 0,
      stats: {
        quantityDrank: 0,
        totalMoney: 0,
      },
    });
  };
};

export const useAccountEditor = () => {
  const db = getFirestore();

  return async (account: Account, firstName: string, lastName: string, school: School) => {
    console.log(`Updating ${firstName} ${lastName}`);
    await updateDoc(doc(db, `accounts/${account.id}`).withConverter(accountConverter), { firstName, lastName, school });
  };
};

export const useMakeMember = () => {
  const db = getFirestore();
  const staff = useStaffUser();
  const event = useCurrentEvent();

  if (!staff) return () => alert("Not connected !");

  const staffRef = doc(db, `staffs/${staff.id}`).withConverter(staffConverter);

  return async (account: Account) => {
    console.log(`Making ${account.firstName} ${account.lastName} a member`);

    const accountRef = doc(db, `accounts/${account.id}`).withConverter(accountConverter);
    const transactionRef = doc(collection(db, `events/${event!.id}/transactions`)).withConverter(transactionConverter);

    const batch = writeBatch(db);
    batch.set(transactionRef, {
      id: "0",
      type: TransactionType.Membership,
      price: MEMBERSHIP_PRICE,
      customer: accountRef,
      staff: staffRef,
      createdAt: new Date(),
    });
    batch.update(accountRef, { isMember: true });

    await batch.commit();
  };
};

export const useAccountDeleter = () => {
  const db = getFirestore();

  return async (account: Account) => {
    console.log(`Deleting ${account.firstName} ${account.lastName}`);
    await deleteDoc(doc(db, `accounts/${account.id}`));
  };
};

export const useRechargeTransactionMaker = () => {
  const db = getFirestore();
  const staff = useStaffUser();
  const event = useCurrentEvent();

  if (!staff) return () => alert("Not connected !");

  const staffRef = doc(db, `staffs/${staff.id}`).withConverter(staffConverter);

  return async (account: Account, amount: number) => {
    const accountRef = doc(db, `accounts/${account.id}`).withConverter(accountConverter);

    const transactionRef = doc(collection(db, `events/${event!.id}/transactions`)).withConverter(transactionConverter);

    const batch = writeBatch(db);
    batch.set(transactionRef, {
      id: "0",
      type: TransactionType.Recharge,
      amount: amount,
      customer: accountRef,
      staff: staffRef,
      createdAt: new Date(),
    });
    batch.update(accountRef, {
      balance: account.balance + amount,
      stats: {
        quantityDrank: account.stats.quantityDrank,
        totalMoney: account.stats.totalMoney + amount,
      },
    });

    await batch.commit();
  };
};

export const computeTotal = (beer: BeerWithType | undefined, selectedAddons: number[], quantity: number) => {
  const baseBeer = beer?.type.price ?? 0;
  const addons = beer === null ? 0 : selectedAddons
    .map((aId) => beer!.type.addons.find(({ }, i) => aId === i)!)
    .reduce((acc, { price }) => acc + price, 0);

  return baseBeer * quantity + addons;
};

export const usePayTransactionMaker = () => {
  const db = getFirestore();
  const staff = useStaffUser();
  const event = useCurrentEvent();

  if (!staff) return () => alert("Not connected !");

  const staffRef = doc(db, `staffs/${staff.id}`).withConverter(staffConverter);

  return async (account: Account, beer: BeerWithType, addons: number[], quantity: number) => {
    const price = computeTotal(beer, addons, quantity);

    const beerRef = doc(db, `beers/${beer.beer.id}`).withConverter(beerConverter);
    const accountRef = doc(db, `accounts/${account.id}`).withConverter(accountConverter);

    const transactionRef = doc(collection(db, `events/${event!.id}/transactions`)).withConverter(transactionConverter);

    const batch = writeBatch(db);
    // Transaction
    batch.set(transactionRef, {
      id: "0",
      type: TransactionType.Drink,
      beer: beerRef,
      addons,
      quantity,
      price,
      customer: accountRef,
      staff: staffRef,
      createdAt: new Date(),
    });
    // Balance & stats
    batch.update(accountRef, {
      balance: account.balance - price,
      stats: {
        quantityDrank: account.stats.quantityDrank + quantity,
        totalMoney: account.stats.totalMoney,
      },
    });

    await batch.commit();
  };
};

export const useSetBeerAvailability = () => {
  const db = getFirestore();
  const staff = useStaffUser();

  if (!staff) return () => alert("Not connected !");

  return async (beer: Beer, isAvailable: boolean) => {
    await updateDoc(doc(db, `beers/${beer.id}`).withConverter(beerConverter), {
      isAvailable,
    });
  };
};