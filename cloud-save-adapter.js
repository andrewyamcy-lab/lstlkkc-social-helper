// cloud-save-adapter.js

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const STORAGE_KEYS = {
  rpgProgress: "asd_school_rpg_progress_v1",
  badges: "asd_school_badges_v2",
  missionHistory: "asd_school_mission_result_history_v1",
  reputation: "asd_school_reputation_v1",
  selectedCharacter: "asd_school_selected_character_v1",
  characterTab: "asd_school_character_tab_v1",
  mainProgress: "asd_school_rpg_v5"
};

let autoSaveTimer = null;
let isRestoringCloudProgress = false;

function getFirebaseUser() {
  return window.LSTFirebase && window.LSTFirebase.user
    ? window.LSTFirebase.user
    : null;
}

function getFirestoreDb() {
  return window.LSTFirebase && window.LSTFirebase.db
    ? window.LSTFirebase.db
    : null;
}

function safeReadLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Cannot read localStorage:", key, error);
    return null;
  }
}

function safeWriteLocalStorage(key, value) {
  try {
    if (value === null || typeof value === "undefined") return;
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Cannot write localStorage:", key, error);
  }
}

function collectLocalProgress() {
  const data = {};

  Object.keys(STORAGE_KEYS).forEach(function (name) {
    const key = STORAGE_KEYS[name];
    data[name] = safeReadLocalStorage(key);
  });

  return data;
}

function restoreLocalProgress(data) {
  if (!data || typeof data !== "object") return;
  isRestoringCloudProgress = true;

  Object.keys(STORAGE_KEYS).forEach(function (name) {
    const key = STORAGE_KEYS[name];

    if (typeof data[name] !== "undefined" && data[name] !== null) {
      safeWriteLocalStorage(key, data[name]);
    }
  });

  setTimeout(function () {
    isRestoringCloudProgress = false;
  }, 800);
}

window.saveCloudProgress = async function () {
  const user = getFirebaseUser();
  const db = getFirestoreDb();

  if (!user || !db) {
    if (typeof showToast === "function") {
      showToast("請先登入 Google，才可同步雲端。", "warning");
    } else {
      alert("請先登入 Google，才可同步雲端。");
    }
    return false;
  }

  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
      progress: {
        ...collectLocalProgress(),
        updatedAt: serverTimestamp()
      }
    },
    { merge: true }
  );

  if (typeof showToast === "function") {
    showToast("已儲存到雲端。", "success");
  }

  return true;
};

window.loadCloudProgress = async function () {
  const user = getFirebaseUser();
  const db = getFirestoreDb();

  if (!user || !db) return false;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await window.saveCloudProgress();
    return true;
  }

  const data = snap.data();
  const progress = data && data.progress ? data.progress : null;

  if (progress) {
    restoreLocalProgress(progress);

    if (typeof loadProgress === "function") loadProgress();
    if (typeof renderBadges === "function") renderBadges();
    if (typeof renderCharacterScreen === "function") renderCharacterScreen();
    if (typeof syncScenarioTotal === "function") syncScenarioTotal();

    if (typeof showToast === "function") {
      showToast("已載入雲端紀錄。", "success");
    }
  }

  return true;
};

window.scheduleCloudSave = function () {
  if (isRestoringCloudProgress) return;
  if (!getFirebaseUser()) return;

  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(function () {
    autoSaveTimer = null;
    window.saveCloudProgress().catch(function (error) {
      console.warn("Auto cloud save failed:", error);
    });
  }, 1200);
};

window.addEventListener("storage", function (event) {
  if (!event || !event.key) return;
  if (Object.values(STORAGE_KEYS).includes(event.key)) {
    window.scheduleCloudSave();
  }
});

window.addEventListener("reputationUpdated", window.scheduleCloudSave);
window.addEventListener("lstAuthReady", function (event) {
  if (event.detail && event.detail.user) {
    setTimeout(function () {
      window.loadCloudProgress();
    }, 500);
  }
});
