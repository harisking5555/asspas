import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyD8831XfcP1qRgSoAODDMEAMMPLI6Z81TE",
  authDomain: "asspas-611e9.firebaseapp.com",
  projectId: "asspas-611e9",
  storageBucket: "asspas-611e9.firebasestorage.app",
  messagingSenderId: "395544334109",
  appId: "1:395544334109:web:a648d2286ed5f856f75bf4",
  measurementId: "G-LE70TYQS2H"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with experimentalAutoDetectLongPolling: true
// This automatically switches to long polling if WebSockets fail or are delayed,
// preventing the "Could not reach Cloud Firestore backend. Backend didn't respond within 10 seconds" error.
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;
export const storage = getStorage(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Standard Firestore error handling helper per firebase integration guidelines
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string): never {
  const err = error as { code?: string; message?: string };
  const errInfo = {
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || null,
    },
    errorCode: err?.code,
    errorMessage: err?.message,
  };
  console.error('Firebase Operation Error:', JSON.stringify(errInfo, null, 2));
  throw error;
}
