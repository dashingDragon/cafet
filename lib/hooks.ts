import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Staff, staffConverter } from './staffs';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';

export const useUser = () => {
    const auth = getAuth();
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    });

    return user;
};

export const useGuardIsConnected = () => {
    const auth = getAuth();
    const router = useRouter();
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                console.log('Not logged in, redirecting to /login');
                router.replace('/login');
            }
        });
    }, [auth, router]);

    return user;
};

export const useGuardIsStaff = () => {
    const db = getFirestore();
    const router = useRouter();
    const user = useGuardIsConnected();
    const [staffUser, setStaffUser] = useState(undefined as Staff | undefined);

    useEffect(() => {
        if (user) {
            const q = doc(db, `staffs/${user?.uid}`).withConverter(staffConverter);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                try {
                    const staff = snapshot.data();
                    if (!staff) {
                        console.log('Not a staff, redirecting to /error/unauthorized');
                        router.replace('/error/unauthorized');
                    } else {
                        setStaffUser(staff);
                    }
                } catch (error) {
                    console.log('Not a staff, redirecting to /error/unauthorized');
                    router.replace('/error/unauthorized');
                }
            });

            return () => {
                unsubscribe(); // Unsubscribe when component unmounts
            };
        }
    }, [db, router, user]);

    return staffUser;
};


export const useGuardIsAdmin = () => {
    const db = getFirestore();
    const router = useRouter();
    const user = useGuardIsConnected();
    const [staffUser, setStaffUser] = useState(undefined as Staff | undefined);

    useEffect(() => {
        if (user) {
            const q = doc(db, `staffs/${user?.uid}`).withConverter(staffConverter);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                try {
                    const staff = snapshot.data();
                    if (!staff || !staff.isAdmin) {
                        console.log('Not an admin, redirecting to /error/unauthorized');
                        router.replace('/error/unauthorized');
                    } else {
                        setStaffUser(staff);
                    }
                } catch (error) {
                    console.log('Not an admin, redirecting to /error/unauthorized');
                    router.replace('/error/unauthorized');
                }
            });

            return () => {
                unsubscribe(); // Unsubscribe when component unmounts
            };
        }
    }, [db, router, user]);

    return staffUser;
};
