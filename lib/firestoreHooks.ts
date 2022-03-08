import { getFirestore, collection, query, orderBy, onSnapshot, doc, writeBatch, limit, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Account, accountConverter, School } from "./accounts";
import { useUser } from "./hooks";
import { Staff, staffConverter } from "./staffs";
import { transactionConverter, TransactionType } from "./transactions";
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

export const useCurrentEvent = () => {
  const db = getFirestore();
  const user = useUser();
  const [currentEvent, setCurrentEvent] = useState(undefined as SbeereckEvent | undefined);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("created", "asc"), limit(1)).withConverter(eventConverter);
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((a) => a.data());
      if (events.length > 1) throw Error("wat");

      setCurrentEvent(events[0]);
    });
  }, [db, user]);

  return currentEvent;
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

  useMemo(() => {
    setBeerWithTypes(beers.map((b) => ({
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

  return async (account: Account) => {
    console.log(`Making ${account.firstName} ${account.lastName} a member`);
    await updateDoc(doc(db, `accounts/${account.id}`).withConverter(accountConverter), { isMember: true });
  };
};

export const useAccountDeleter = () => {
  const db = getFirestore();

  return async (account: Account) => {
    console.log(`Deleting ${account.firstName} ${account.lastName}`);
    await deleteDoc(doc(db, `accounts/${account.id}`));
  }
}

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
    batch.update(accountRef, { balance: account.balance + amount });

    await batch.commit();
  };
};
