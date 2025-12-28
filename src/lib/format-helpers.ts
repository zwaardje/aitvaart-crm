/**
 * Helper functions for formatting dates, times, and file sizes
 */

/**
 * Format a date string to Dutch locale format (dd-MM-yyyy)
 * @param date - Date string, null, or undefined
 * @returns Formatted date string or "-" if invalid/missing
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/**
 * Format a date string to Dutch locale format with time (for document dates)
 * @param dateString - Date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a time string to HH:MM format
 * @param time - Time string (can be HH:MM:SS or HH:MM), null, or undefined
 * @param forDisplay - If true, returns "-" for null/undefined. If false, returns "" (for forms)
 * @returns Formatted time string or "-"/"" if invalid/missing
 */
export function formatTime(
  time: string | null | undefined,
  forDisplay: boolean = true
): string {
  if (!time) return forDisplay ? "-" : "";
  // If time is in HH:MM:SS format, extract HH:MM
  if (time.includes(":")) {
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

/**
 * Format bytes to human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

