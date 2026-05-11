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
let suppressAutoSaveUntil = 0;

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

function shouldSuppressAutoSave() {
  return isRestoringCloudProgress || Date.now() < suppressAutoSaveUntil;
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

function keepMainProgressOnCover(raw) {
  try {
    if (!raw) return raw;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      parsed.currentScreen = "cover";
    }
    return JSON.stringify(parsed);
  } catch (error) {
    return raw;
  }
}

function collectLocalProgress() {
  const data = {};

  Object.keys(STORAGE_KEYS).forEach(function (name) {
    const key = STORAGE_KEYS[name];
    data[name] = safeReadLocalStorage(key);
  });

  data.mainProgress = keepMainProgressOnCover(data.mainProgress);
  return data;
}

function restoreLocalProgress(data) {
  if (!data || typeof data !== "object") return;

  isRestoringCloudProgress = true;
  suppressAutoSaveUntil = Date.now() + 3500;
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  Object.keys(STORAGE_KEYS).forEach(function (name) {
    const key = STORAGE_KEYS[name];

    if (typeof data[name] !== "undefined" && data[name] !== null) {
      const value = name === "mainProgress" ? keepMainProgressOnCover(data[name]) : data[name];
      safeWriteLocalStorage(key, value);
    }
  });

  setTimeout(function () {
    isRestoringCloudProgress = false;
  }, 1200);
}

window.saveCloudProgress = async function (options) {
  const opts = options || {};
  const silent = Boolean(opts.silent);
  const user = getFirebaseUser();
  const db = getFirestoreDb();

  if (!user || !db) {
    if (!silent && typeof showToast === "function") {
      showToast("請先登入 Google，才可同步雲端。", "warning");
    } else if (!silent) {
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
        updatedAt: serverTimestamp(),
        autoSavedAt: new Date().toISOString()
      }
    },
    { merge: true }
  );

  window.dispatchEvent(new CustomEvent("cloudProgressSaved", { detail: { uid: user.uid } }));

  if (!silent && typeof showToast === "function") {
    showToast("已同步到雲端。", "success");
  }

  return true;
};

window.loadCloudProgress = async function () {
  const user = getFirebaseUser();
  const db = getFirestoreDb();

  if (!user || !db) return false;

  suppressAutoSaveUntil = Date.now() + 3500;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    suppressAutoSaveUntil = Date.now() + 3500;
    return true;
  }

  const data = snap.data();
  const progress = data && data.progress ? data.progress : null;

  if (progress) {
    restoreLocalProgress(progress);

    // Refresh data-dependent UI only. Do not switch screen here.
    if (typeof loadProgress === "function") loadProgress();
    if (typeof renderBadges === "function") renderBadges();
    if (typeof renderCharacterScreen === "function") renderCharacterScreen();
    if (typeof syncScenarioTotal === "function") syncScenarioTotal();

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }

    suppressAutoSaveUntil = Date.now() + 3500;
  }

  return true;
};

window.scheduleCloudSave = function (options) {
  const opts = options || {};
  if (!opts.force && shouldSuppressAutoSave()) return;
  if (!getFirebaseUser()) return;

  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(function () {
    autoSaveTimer = null;
    if (!opts.force && shouldSuppressAutoSave()) return;
    window.saveCloudProgress({ silent: true }).catch(function (error) {
      console.warn("Auto cloud save failed:", error);
    });
  }, opts.delay || 1500);
};

function patchSaveProgressForAutoSave() {
  if (typeof window.saveProgress !== "function" || window.saveProgress.__cloudAutoSavePatched) return;

  const originalSaveProgress = window.saveProgress;
  window.saveProgress = function () {
    const result = originalSaveProgress.apply(this, arguments);
    setTimeout(function () {
      window.scheduleCloudSave();
    }, 0);
    return result;
  };
  window.saveProgress.__cloudAutoSavePatched = true;
}

function installAutoSaveHooks() {
  // Do not auto-save merely because the website opens or localStorage changes during startup.
  // Cloud auto-save is only triggered through saveProgress(), which is called after mission completion/manual progress save.
  patchSaveProgressForAutoSave();
  setTimeout(patchSaveProgressForAutoSave, 500);
  setTimeout(patchSaveProgressForAutoSave, 1500);
  setTimeout(patchSaveProgressForAutoSave, 3000);
}

window.addEventListener("cloudSaveRequested", function () {
  window.scheduleCloudSave({ force: true, delay: 300 });
});

window.addEventListener("lstAuthReady", function (event) {
  installAutoSaveHooks();
  if (event.detail && event.detail.user) {
    setTimeout(function () {
      window.loadCloudProgress().then(function () {
        if (typeof window.showAuthenticatedCoverScreen === "function") {
          window.showAuthenticatedCoverScreen();
        }
      });
    }, 300);
  }
});

installAutoSaveHooks();
