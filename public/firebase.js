import {

  initializeApp

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

  getAuth,

  GoogleAuthProvider,

  signInWithPopup,

  signOut,

  onAuthStateChanged

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const firebaseConfig = {

  apiKey:
    "AIzaSyDbS5YvKAp3GkEj5SUvbuzNILQCnOE3q48",

  authDomain:
    "myvault-37497.firebaseapp.com",

  projectId:
    "myvault-37497",

  storageBucket:
    "myvault-37497.firebasestorage.app",

  messagingSenderId:
    "311906655873",

  appId:
    "1:311906655873:web:2743494662a9c90d73f780",

  measurementId:
    "G-VKEHWVX4FR"
};


// INITIALIZE

const app =
  initializeApp(
    firebaseConfig
  );

const auth =
  getAuth(app);

const provider =
  new GoogleAuthProvider();


// LOGIN

window.googleLogin =
  async function () {

    try {

      await signInWithPopup(

        auth,
        provider
      );

    } catch (error) {

      console.log(error);
    }
  };


// LOGOUT

window.logout =
  async function () {

    await signOut(auth);
  };


// USER STATE

onAuthStateChanged(

  auth,

  (user) => {

    if (user) {

      // SAVE USER ID

      localStorage.setItem(

        "userId",

        user.uid
      );


      // USER PROFILE

      document.getElementById(

        "userPhoto"

      ).src = user.photoURL;


      document.getElementById(

        "userName"

      ).innerText = user.displayName;


      document.getElementById(

        "userEmail"

      ).innerText = user.email;


      // SHOW APP

      document.getElementById(
        "loginScreen"
      ).style.display = "none";


      document.getElementById(
        "mainApp"
      ).style.display = "block";

    } else {

      // SHOW LOGIN

      document.getElementById(
        "loginScreen"
      ).style.display = "flex";


      document.getElementById(
        "mainApp"
      ).style.display = "none";
    }
  }
);