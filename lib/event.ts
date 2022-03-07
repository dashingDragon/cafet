import { FirestoreDataConverter } from "firebase/firestore";

export type SbeereckEvent = {
    id: string,
    name: string,
    created: Date,
};

export const eventConverter: FirestoreDataConverter<SbeereckEvent> = {
  fromFirestore: (snapshot, options) => {
    const event = snapshot.data(options);
    const { name, created } = event;
    return {
      id: snapshot.id,
      name,
      created,
    };
  },
  toFirestore: (event) => {
    const { name, created } = event;
    return { name, created };
  },
};
