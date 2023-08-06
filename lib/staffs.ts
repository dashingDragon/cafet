import { FirestoreDataConverter } from "firebase/firestore";

export type MakeStaffPayload = {
  uid: string,
  name: string,
};

export type Staff = {
    id: string,
    name: string,
    isAvailable: boolean,
    isAdmin: boolean,
    phone: string | undefined,
};

export const staffConverter: FirestoreDataConverter<Staff> = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    const { name, isAvailable, isAdmin, phone } = data;
    return {
      id: snapshot.id,
      name,
      isAvailable,
      isAdmin,
      phone,
    };
  },
  toFirestore: (staff) => {
    const { name, isAvailable, isAdmin, phone } = staff;
    return { name, isAvailable, isAdmin, phone };
  },
};
