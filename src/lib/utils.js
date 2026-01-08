import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. This handles your Tailwind classes (fixes 'cn' errors)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 2. This handles your navigation (fixes 'createPageUrl' errors)
export const createPageUrl = (pageName) => {
  const routes = {
    Home: '/',
    Calendar: '/calendar',
    Vault: '/vault',
    Settings: '/settings',
    Welcome: '/welcome'
  };
  return routes[pageName] || '/';
};