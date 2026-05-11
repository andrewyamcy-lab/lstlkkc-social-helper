// firebase-auth-cloud.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.LSTFirebase = {
  app,
  auth,
  db,
  user: null,
  ready: false
};

window.signInWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    await saveUserProfile(result.user);

    if (typeof window.loadCloudProgress === "function") {
      await window.loadCloudProgress();
    }

    if (typeof showToast === "function") {
      showToast("Google 登入成功，已同步雲端紀錄。", "success");
    } else {
      alert("Google 登入成功");
    }
  } catch (error) {
    console.error("Google login failed:", error);
    alert("Google 登入失敗，請再試一次。\n" + (error && error.message ? error.message : ""));
  }
};

window.logoutGoogle = async function () {
  try {
    await signOut(auth);

    if (typeof showToast === "function") {
      showToast("已登出 Google 帳戶。", "success");
    } else {
      alert("已登出");
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

async function saveUserProfile(user) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
      profile: {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp()
      }
    },
    { merge: true }
  );
}

onAuthStateChanged(auth, async function (user) {
  window.LSTFirebase.user = user || null;
  window.LSTFirebase.ready = true;

  updateLoginUI(user);

  if (user) {
    await saveUserProfile(user);

    if (typeof window.loadCloudProgress === "function") {
      await window.loadCloudProgress();
    }
  }

  window.dispatchEvent(
    new CustomEvent("lstAuthReady", {
      detail: { user: user || null }
    })
  );
});

function updateLoginUI(user) {
  const loginBox = document.getElementById("loginBox");
  const userBox = document.getElementById("userBox");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userPhoto = document.getElementById("userPhoto");

  if (!loginBox || !userBox) return;

  if (user) {
    loginBox.style.display = "none";
    userBox.style.display = "block";

    if (userName) userName.textContent = user.displayName || "Google User";
    if (userEmail) userEmail.textContent = user.email || "";
    if (userPhoto && user.photoURL) {
      userPhoto.src = user.photoURL;
      userPhoto.style.display = "block";
    }
  } else {
    loginBox.style.display = "block";
    userBox.style.display = "none";
    if (userPhoto) {
      userPhoto.removeAttribute("src");
      userPhoto.style.display = "none";
    }
  }
}
