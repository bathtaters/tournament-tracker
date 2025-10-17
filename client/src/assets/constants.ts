// Import info from package.json
import pkg from "../../package.json";

export const version: string = pkg.version;

// -- User Messages -- \\

export const planMessage = {
  noPlan: "This plan is inactive right now.",
  notSignedIn: "Please sign in to vote.",
  notVoter: "You are not a participant in this plan.",
};

// -- String Sets -- \\

export const footerText = (apiVersion?: string) =>
  `bathtaters • 2022 • UI v${version} • API v${apiVersion || "....."}`;

export const dragType = {
  event: "json/eventDay",
  player: "json/matchPlayer",
  vote: "json/vote",
};
export const boxIDs = { RANKED: "ranked", UNRANKED: "unranked" };

export const statusInfo: {
  label: string;
  badge: string;
  linkClass: string;
  textClass: string;
}[] = [
  {
    label: "N/A",
    badge: "badge-warning",
    linkClass: "link-warning",
    textClass: "text-warning",
  },
  {
    label: "Unstarted",
    badge: "badge-primary",
    linkClass: "link-primary",
    textClass: "text-primary dark:text-primary-content",
  },
  {
    label: "Active",
    badge: "badge-accent",
    linkClass: "link-accent",
    textClass: "text-accent-content dark:text-accent",
  },
  {
    label: "Finished",
    badge: "badge-ghost",
    linkClass: "",
    textClass: "text-base-content",
  },
  {
    label: "N/A",
    badge: "badge-warning",
    linkClass: "link-warning",
    textClass: "text-warning",
  },
];

export const playerAccess = ["Guest", "Player", "Judge", "Gonti"];

export const planTitle = [
  "Inactive Plan",
  "Vote Setup",
  "Rank Events",
  "Generating",
  "Proposed Schedule",
];

export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const roundButtonText = {
  none: "",
  begin: "Start Event",
  end: "End Event",
  back: "Delete Round",
  next: "Next Round",
  wait: "Awaiting Report",
  done: "Event Complete",
};

// Lock Screen captions
export const roundButtonLockCaption = "Generating round...";
export const editEventLockCaptions = ["Creating event...", "Updating event..."];
export const resetDataLockCaption = "Resetting data...";
export const reportLockCaption = "Updating standings...";
export const createLockCaption = (type: string) => `Creating ${type}...`;

// -- Server error adapters -- \\

export const roundThresholdMsg =
  "Will not use pairing algorithm due to technical limitations.";
// Threshold set in /api/src/config/meta.js

// FORMAT = endpoint: (arg) => `Endpoint ${arg}`,
export const errorTitle = {
  default: (_?: any) => "Error",
};

// FORMAT = msg/TEXT_STATUS: (arg) => `New msg ${arg}.`,
export const errorMessage = {
  default: (_?: any) => "An unknown server error occurred.",
  PARSING_ERROR: (args?: any) => {
    console.error("Invalid server response", args);
    return "Server is not responding.";
  },
};
