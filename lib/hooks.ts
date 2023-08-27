import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useFirestoreUser } from './firestoreHooks';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    return user;
};

export const useGuardIsStaff = () => {
    const router = useRouter();
    const firestoreStaffUser = useFirestoreUser();

    useEffect(() => {
        if (firestoreStaffUser) {
            if (!firestoreStaffUser.isStaff) {
                console.error('Not a staff, redirecting to /error/unauthorized');
                router.replace('/error/unauthorized');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestoreStaffUser]);

    return firestoreStaffUser;
};

export const useGuardIsAdmin = () => {
    const router = useRouter();
    const firestoreAdminUser = useFirestoreUser();

    useEffect(() => {
        if (firestoreAdminUser) {
            if (!firestoreAdminUser.isAdmin) {
                console.error('Not an admin, redirecting to /error/unauthorized');
                router.replace('/error/unauthorized');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestoreAdminUser]);

    return firestoreAdminUser;
};
