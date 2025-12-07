// Shared constants for funeral status display configuration
// Used across funeral components for consistent status labels and colors

export type FuneralStatus = "planning" | "active" | "completed" | "cancelled";

export interface FuneralStatusConfig {
  label: string;
  color: string;
}

export const FUNERAL_STATUS_CONFIG: Record<FuneralStatus, FuneralStatusConfig> =
  {
    planning: {
      label: "Voorgesprek",
      color: "bg-yellow-100 text-yellow-700",
    },
    active: {
      label: "Overleden",
      color: "bg-blue-100 text-blue-700",
    },
    completed: {
      label: "Afgerond",
      color: "bg-gray-100 text-gray-700",
    },
    cancelled: {
      label: "Geannuleerd",
      color: "bg-red-100 text-red-700",
    },
  };

export const FUNERAL_STATUS_OPTIONS = [
  { value: "planning", label: "Voorgesprek" },
  { value: "active", label: "Overleden" },
  { value: "completed", label: "Afgerond" },
  { value: "cancelled", label: "Geannuleerd" },
];

// Helper function to get funeral status display info
// Can accept either a status string or a funeral object with a status property
export function getFuneralStatusDisplay(
  statusOrFuneral:
    | FuneralStatus
    | null
    | undefined
    | { status?: FuneralStatus | null }
): {
  status: FuneralStatus;
  label: string;
  color: string;
} {
  let status: FuneralStatus;

  if (typeof statusOrFuneral === "string") {
    status = statusOrFuneral || "planning";
  } else if (
    statusOrFuneral &&
    typeof statusOrFuneral === "object" &&
    "status" in statusOrFuneral
  ) {
    status = statusOrFuneral.status || "planning";
  } else {
    status = "planning";
  }

  const config = FUNERAL_STATUS_CONFIG[status];

  return {
    status,
    ...config,
  };
}
