import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { IMAGE_BASE_URL } from "./api-client";
import placeholderImg from "@/assets/images/placeholder.png";

export function formatImageURL(path?: string | null, type: 'merch' | 'event' = 'merch') {
  if (!path || path === 'fallback.png' || path === 'fallback-merch.png' || path === 'fallback-event.png') {
    return placeholderImg;
  }
  
  if (path.startsWith('http')) return path;
  if (path.includes('picsum.photos')) return path;
  
  let cleanPath = path;
  if (!path.startsWith('/') && !path.includes('uploads/')) {
    const prefix = type === 'merch' ? 'uploads/images/merchandise' : 'uploads/images/events';
    cleanPath = `${prefix}/${path}`;
  }
  
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${IMAGE_BASE_URL}${finalPath}`;
}

export const getPlaceholderImage = () => placeholderImg;
