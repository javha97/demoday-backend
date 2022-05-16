import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC50Vb9vCVqdiQT5yAePzN2d1Yp3OdefKM",
  authDomain: "demoday-3c8d0.firebaseapp.com",
  projectId: "demoday-3c8d0",
  storageBucket: "demoday-3c8d0.appspot.com",
  messagingSenderId: "712774865518",
  appId: "1:712774865518:web:cae8a81ade42dd3c24cc7f"
};
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)