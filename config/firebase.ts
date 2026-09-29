import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDi5Ek90yQBUQEirTP_z4jTg_pSlfWzlE0',
    authDomain: 'teajudo-90838.firebaseapp.com',
    projectId: 'teajudo-90838',
    storageBucket: 'teajudo-90838.firebasestorage.app',
    messagingSenderId: '480954106979',
    appId: '1:480954106979:web:65dca011a92198dc7e2456',
};

const app =
    getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

