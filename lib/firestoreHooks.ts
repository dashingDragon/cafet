import { getFirestore, collection, getDocs, query, orderBy, onSnapshot, doc, updateDoc, runTransaction, writeBatch, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Account, accountConverter } from "./accounts";
import { useUser } from "./hooks";
import { Staff, staffConverter } from "./staffs";
import { transactionConverter, TransactionRecharge, TransactionType } from "./transactions";
import { eventConverter, SbeereckEvent } from "./event";

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
