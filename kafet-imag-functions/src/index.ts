/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import type { } from "firebase-admin";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {MakeStaffPayload, Staff, staffConverter as externalStaffConverter} from "../../lib/staffs";
import {ListPendingStaffs} from "../../lib/firebaseFunctionHooks";
import {FirestoreDataConverter} from "@google-cloud/firestore";

// Trust me I know what I am doing
const staffConverter = externalStaffConverter as unknown as FirestoreDataConverter<Staff>;

admin.initializeApp();

const checkIfAdmin = async (uid: string | undefined) => {
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "You need to be connected.");
  }

  const staff = await admin.firestore().doc(`staffs/${uid}`).withConverter(staffConverter).get();
  if (!staff.exists) {
    throw new functions.https.HttpsError("permission-denied", "You are not a staff.");
  }

  const isAdmin = staff.data()?.isAdmin ?? false;
  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "You are not an admin.");
  }
};

export const listPendingStaffs = functions.https.onCall(async (data, context) => {
  checkIfAdmin(context.auth?.uid);

  // There is always less than 1000 users
  const users = (await admin.auth().listUsers()).users;

  const staffsId = (await admin.firestore().collection("staffs").withConverter(staffConverter).get())
    .docs.map((s) => s.data().id);

  const pendingUsers = users.filter(({uid}) => !staffsId.includes(uid));

  return {
    users: pendingUsers.map((u) => ({
      uid: u.uid,
      name: u.displayName,
      email: u.email,
    })),
  } as ListPendingStaffs;
});

export const makeStaff = functions.https.onCall(async (data, context) => {
  checkIfAdmin(context.auth?.uid);

  const {uid, name} = (data as MakeStaffPayload);
  const staffRef = (await admin.firestore().doc(`staffs/${uid}`).withConverter(staffConverter));

  await staffRef.create({
    id: uid,
    name,
    isAvailable: false,
    isAdmin: false,
    phone: "1",
  });

  return {success: true};
});
