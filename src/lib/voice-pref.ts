"use client";

import { useSyncExternalStore } from "react";

const KEY = "aum-voice";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function isVoiceOn() {
  return read();
}

export function setVoiceOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  emit();
}

export function subscribeVoice(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function useVoiceOn() {
  return useSyncExternalStore(subscribeVoice, read, () => false);
}
