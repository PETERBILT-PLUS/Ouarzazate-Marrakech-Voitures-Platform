import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB3J1I-tuSh9fogEvRYOb4OWEMGqZrbsm0",
  authDomain: "voiture-location-caa99.firebaseapp.com",
  projectId: "voiture-location-caa99",
  storageBucket: "voiture-location-caa99.appspot.com",
  messagingSenderId: "1079766810341",
  appId: "1:1079766810341:web:352412b5b6dcf79a609e0c"
};

export const app = initializeApp(firebaseConfig);