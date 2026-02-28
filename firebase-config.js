// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-ZkjFasOkUy5vaxmN0Vd7zZsrcRA3ELA",
    authDomain: "dwarakamai-invoice.firebaseapp.com",
    projectId: "dwarakamai-invoice",
    storageBucket: "dwarakamai-invoice.firebasestorage.app",
    messagingSenderId: "226477250748",
    appId: "1:226477250748:web:c69a1b3a4200a0676e18b9"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();