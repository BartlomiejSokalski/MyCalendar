

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//  konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDpEfRChfU39PJ3EA3Z3d_Fb0G2709bY",
    authDomain: "calendar-c5841.firebaseapp.com",
    projectId: "calendar-c5841",
    storageBucket: "calendar-c5841.appspot.com",
    messagingSenderId: "215951346678",
    appId: "1:215951346678:web:2b80e72a6210e3cc5615d7",
    measurementId: "G-83L7SLEW28"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

export { db };
