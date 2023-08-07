import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
