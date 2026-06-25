const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Entorno Vercel (Variables de Entorno seguras)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    console.log("🔥 Firebase Admin conectado correctamente (Modo Vercel).");
  } else if (fs.existsSync(serviceAccountPath)) {
    // Entorno Local (Windows)
    const serviceAccount = require(serviceAccountPath);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    console.log("🔥 Firebase Admin conectado correctamente (Modo Local).");
  } else {
    // Entorno Nube (Google Cloud Run)
    if (getApps().length === 0) {
      initializeApp(); // Usa Application Default Credentials automáticamente
    }
    console.log("🔥 Firebase Admin conectado correctamente (Modo GCP).");
  }
} catch (error) {
  console.error("❌ Error al inicializar Firebase Admin:", error.message);
}

const db = getApps().length > 0 ? getFirestore() : null;

module.exports = db;
