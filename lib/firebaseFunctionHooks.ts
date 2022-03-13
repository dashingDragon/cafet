import { getFunctions, httpsCallable } from "firebase/functions"
import { useEffect, useState } from "react";
import { MakeStaffPayload } from "./staffs";

export type PendingStaff = {
    uid: string,
    name: string,
    email: string,
};

export type ListPendingStaffs = {
    users: PendingStaff[],
};

export const useListPendingStaffs = () => {
    const functions = getFunctions();
    const fun = httpsCallable(functions, "listPendingStaffs");

    return async () => {
        console.log("Called function listPendingStaffs");
        return (await fun({})).data as ListPendingStaffs;
    };
};

export const usePendingStaffs: () => [PendingStaff[], () => Promise<void>] = () => {
    const listPendingStaffs = useListPendingStaffs();
    const [pending, setPending] = useState([] as PendingStaff[]);

    const refresh = async () => {
        setPending((await listPendingStaffs()).users);
    };

    return [pending, refresh];
}

export const useMakeStaff = () => {
    const functions = getFunctions();
    const fun = httpsCallable(functions, "makeStaff");

    return async (payload: MakeStaffPayload) => {
        console.log("Called function makeStaff");
        await fun(payload);
    };
};
