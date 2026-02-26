import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, isSameYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "p");
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, "p")}`;
  } else if (isSameYear(date, new Date())) {
    return format(date, "MMM d, p");
  } else {
    return format(date, "MMM d, yyyy, p");
  }
}

