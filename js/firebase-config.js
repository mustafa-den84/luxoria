// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDIqtB-iX4Kb5ybWO6Fnq0EB3ktjR9U4MM",
    authDomain: "luxoria-7b283.firebaseapp.com",
    projectId: "luxoria-7b283",
    storageBucket: "luxoria-7b283.firebasestorage.app",
    messagingSenderId: "466483107787",
    appId: "1:466483107787:web:5f5dd7e56b85e59c7b084e",
    measurementId: "G-T1F59HC9NB"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase already initialized");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("خطأ في تهيئة Firebase: " + error.message);
}

// Export Firebase services
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firestore db:", db);
console.log("Storage:", storage);

// Enable offline persistence (optional)
if (firebase.firestore) {
    db.enablePersistence()
        .then(() => {
            console.log("Firestore offline persistence enabled");
        })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log("Multiple tabs open, persistence can only be enabled in one tab at a time.");
            } else if (err.code == 'unimplemented') {
                console.log("The current browser does not support persistence.");
            }
        });
}

// Clear old images from localStorage on load to free up space
function clearOldImagesOnLoad() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('image_')) {
            keys.push(key);
        }
    }
    // Clear all images to prevent quota issues
    if (keys.length > 0) {
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log(`Cleared ${keys.length} images from localStorage to free space`);
    }
}

clearOldImagesOnLoad();
