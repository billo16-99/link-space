import Storage from 'expo-sqlite/kv-store';

const KEYS = {
  defaultSpace: 'settings_default_space',
  showThumbnail: 'settings_show_thumbnail',
  showTitle: 'settings_show_title',
  showDescription: 'settings_show_description',
  openWith: 'settings_open_with',
  reduceAnimations: 'settings_reduce_animations',
  linkReceived: 'settings_link_received',
  appLock: 'settings_app_lock',
  onboardingCompleted: 'settings_onboarding_completed',
} as const;

export type OpenWith = 'in-app' | 'system';

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = Storage.getItemSync(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch {}
  return fallback;
}

function writeBool(key: string, value: boolean) {
  try {
    Storage.setItemSync(key, String(value));
  } catch {}
}

function readString(key: string, fallback: string): string {
  try {
    const raw = Storage.getItemSync(key);
    if (raw) return raw;
  } catch {}
  return fallback;
}

function writeString(key: string, value: string) {
  try {
    Storage.setItemSync(key, value);
  } catch {}
}

export function getDefaultSpace(): string | null {
  try {
    const raw = Storage.getItemSync(KEYS.defaultSpace);
    if (raw === 'none') return null;
    if (raw) return raw;
  } catch {}
  return null;
}

export function setDefaultSpace(id: string | null) {
  writeString(KEYS.defaultSpace, id ?? 'none');
}

export function getShowThumbnail(): boolean {
  return readBool(KEYS.showThumbnail, true);
}

export function setShowThumbnail(v: boolean) {
  writeBool(KEYS.showThumbnail, v);
}

export function getShowTitle(): boolean {
  return readBool(KEYS.showTitle, true);
}

export function setShowTitle(v: boolean) {
  writeBool(KEYS.showTitle, v);
}

export function getShowDescription(): boolean {
  return readBool(KEYS.showDescription, true);
}

export function setShowDescription(v: boolean) {
  writeBool(KEYS.showDescription, v);
}

export function getOpenWith(): OpenWith {
  return readString(KEYS.openWith, 'in-app') as OpenWith;
}

export function setOpenWith(v: OpenWith) {
  writeString(KEYS.openWith, v);
}

export function getReduceAnimations(): boolean {
  return readBool(KEYS.reduceAnimations, false);
}

export function setReduceAnimations(v: boolean) {
  writeBool(KEYS.reduceAnimations, v);
}

export function getLinkReceived(): boolean {
  return readBool(KEYS.linkReceived, true);
}

export function setLinkReceived(v: boolean) {
  writeBool(KEYS.linkReceived, v);
}

export function getAppLock(): boolean {
  return readBool(KEYS.appLock, false);
}

export function setAppLock(v: boolean) {
  writeBool(KEYS.appLock, v);
}

export function getOnboardingCompleted(): boolean {
  return readBool(KEYS.onboardingCompleted, false);
}

export function setOnboardingCompleted(v: boolean) {
  writeBool(KEYS.onboardingCompleted, v);
}
