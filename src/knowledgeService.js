import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { firebaseConfig } from "./firebase-config.js";
import { knowledgeBase as localKnowledgeBase } from "./data.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export const knowledgeService = {
    /**
     * Signs in the user anonymously for tracking and security.
     */
    async signIn() {
        try {
            const userCredential = await signInAnonymously(auth);
            return userCredential.user.uid;
        } catch (error) {
            console.error("Auth failed:", error);
            return null;
        }
    },
    /**
     * Fetches the knowledge base from Firestore.
     * Falls back to local data if the fetch fails or is empty.
     */
    async getKnowledgeBase() {
        try {
            const kbRef = collection(db, "knowledgeBase");
            const snapshot = await getDocs(kbRef);
            
            if (snapshot.empty) {
                console.warn("Firestore knowledgeBase is empty, using local fallback.");
                return localKnowledgeBase;
            }

            const remoteKB = {};
            snapshot.forEach(doc => {
                remoteKB[doc.id] = doc.data();
            });
            return remoteKB;
        } catch (error) {
            console.error("Error fetching from Firestore:", error);
            return localKnowledgeBase;
        }
    },

    /**
     * Logs a user interaction to Google Cloud/Firebase for analytics.
     */
    async logInteraction(topic, inputType = "click") {
        try {
            const userId = auth.currentUser?.uid || "anonymous";
            const logsRef = collection(db, "interactions");
            const newLogRef = doc(logsRef);
            await setDoc(newLogRef, {
                userId,
                topic,
                type: inputType,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });

            // Dual logging: Firestore for records, Analytics for insights
            logEvent(analytics, 'user_interaction', {
                topic: topic,
                interaction_type: inputType
            });
        } catch (error) {
            // Silently fail logging to not disrupt UX
            console.error("Logging failed:", error);
        }
    }
};
