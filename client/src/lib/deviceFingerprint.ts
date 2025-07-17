// Device fingerprinting utility
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprint
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();
  
  // Collect device information
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || '',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.substring(0, 100), // Truncate for storage
    webgl: getWebGLFingerprint(),
    storage: getStorageFingerprint(),
  };
  
  // Create hash from fingerprint data
  const fingerprintString = JSON.stringify(fingerprint);
  return simpleHash(fingerprintString);
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    return `${vendor}|${renderer}`;
  } catch (e) {
    return '';
  }
}

function getStorageFingerprint(): string {
  try {
    const localStorage = window.localStorage;
    const sessionStorage = window.sessionStorage;
    return `ls:${!!localStorage}|ss:${!!sessionStorage}`;
  } catch (e) {
    return '';
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Get or create device fingerprint
export function getDeviceFingerprint(): string {
  const stored = localStorage.getItem('deviceFingerprint');
  if (stored) {
    return stored;
  }
  
  const fingerprint = generateDeviceFingerprint();
  localStorage.setItem('deviceFingerprint', fingerprint);
  return fingerprint;
}