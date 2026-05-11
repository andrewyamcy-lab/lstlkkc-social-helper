// firebase-auth-cloud.js

import "./cover-menu-final.js";
import "./cloud-save-adapter.js";

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

const ALLOWED_EMAIL = "andrewyamcy@gmail.com";
const ALLOWED_DOMAIN = "@lstlkkc.edu.hk";
const PROFILE_TIMEOUT_MS = 3500;
const CLOUD_LOAD_TIMEOUT_MS = 5500;

window.LSTFirebase = {
  app,
  auth,
  db,
  user: null,
  ready: false,
  cloudReady: false
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedUser(user) {
  const email = normalizeEmail(user && user.email);
  return email === ALLOWED_EMAIL || email.endsWith(ALLOWED_DOMAIN);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error((label || "Operation") + " timed out after " + ms + "ms"));
      }, ms);
    })
  ]);
}

function showLoginError(message) {
  if (typeof showToast === "function") {
    showToast(message, "warning");
  } else {
    alert(message);
  }
}

async function finishAllowedLogin(user, options) {
  const opts = options || {};
  window.LSTFirebase.user = user || null;
  window.LSTFirebase.ready = true;
  window.LSTFirebase.cloudReady = false;
  updateLoginUI(user);

  if (user) {
    try {
      await withTimeout(saveUserProfile(user), PROFILE_TIMEOUT_MS, "Save user profile");
    } catch (error) {
      console.warn("Could not save user profile. Continuing:", error);
    }

    try {
      if (typeof window.loadCloudProgress === "function") {
        await withTimeout(window.loadCloudProgress(), CLOUD_LOAD_TIMEOUT_MS, "Load cloud progress");
      }
    } catch (error) {
      console.warn("Could not load cloud progress in time. Continuing to cover page:", error);
    }

    window.LSTFirebase.cloudReady = true;
  }

  window.dispatchEvent(
    new CustomEvent("lstAuthReady", {
      detail: { user: user || null, cloudReady: Boolean(user), source: opts.source || "auth" }
    })
  );
}

window.signInWithGoogle = async function () {
  try {
    if (typeof window.showAuthLoadingScreen === "function") window.showAuthLoadingScreen();

    const result = await signInWithPopup(auth, provider);

    if (!isAllowedUser(result.user)) {
      const email = result.user && result.user.email ? result.user.email : "此帳戶";
      await signOut(auth);
      window.LSTFirebase.user = null;
      window.LSTFirebase.ready = true;
      window.LSTFirebase.cloudReady = false;
      updateLoginUI(null);
      showLoginError("此帳戶未獲授權：" + email + "\n請使用 @lstlkkc.edu.hk 帳戶，或指定管理員帳戶登入。");
      window.dispatchEvent(new CustomEvent("lstAuthReady", { detail: { user: null, cloudReady: false, source: "blocked" } }));
      return;
    }

    await finishAllowedLogin(result.user, { source: "popup" });

    if (typeof showToast === "function") {
      showToast("Google 登入成功。", "success");
    }
  } catch (error) {
    console.error("Google login failed:", error);
    alert("Google 登入失敗，請再試一次。\n" + (error && error.message ? error.message : ""));
    if (typeof window.showAuthLoginScreen === "function") window.showAuthLoginScreen();
  }
};

window.logoutGoogle = async function () {
  try {
    await signOut(auth);
    window.LSTFirebase.user = null;
    window.LSTFirebase.ready = true;
    window.LSTFirebase.cloudReady = false;
    updateLoginUI(null);

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
  if (!user || !isAllowedUser(user)) return;

  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
      profile: {
        name: user.displayName || "",
        email: normalizeEmail(user.email),
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp()
      }
    },
    { merge: true }
  );
}

onAuthStateChanged(auth, async function (user) {
  if (typeof window.showAuthLoadingScreen === "function") window.showAuthLoadingScreen();

  if (user && !isAllowedUser(user)) {
    const email = user.email || "此帳戶";
    await signOut(auth);
    window.LSTFirebase.user = null;
    window.LSTFirebase.ready = true;
    window.LSTFirebase.cloudReady = false;
    updateLoginUI(null);
    showLoginError("此帳戶未獲授權：" + email + "\n請使用 @lstlkkc.edu.hk 帳戶，或指定管理員帳戶登入。");
    window.dispatchEvent(new CustomEvent("lstAuthReady", { detail: { user: null, cloudReady: false, source: "blocked" } }));
    return;
  }

  if (!user) {
    window.LSTFirebase.user = null;
    window.LSTFirebase.ready = true;
    window.LSTFirebase.cloudReady = false;
    updateLoginUI(null);
    window.dispatchEvent(new CustomEvent("lstAuthReady", { detail: { user: null, cloudReady: false, source: "signed-out" } }));
    return;
  }

  await finishAllowedLogin(user, { source: "state" });
});

function updateLoginUI(user) {
  const loginBox = document.getElementById("loginBox");
  const userBox = document.getElementById("userBox");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userPhoto = document.getElementById("userPhoto");

  if (!loginBox || !userBox) return;

  if (user && isAllowedUser(user)) {
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
