// Import templates
import { basicTemplate } from "./formatting";

// -- String Sets -- \\

export const footerText = "bathtaters – 2022";

export const dragType = { event: "json/eventday", player: "json/matchplayer" };

export const statusInfo = [
  { label: 'N/A',         badge: "badge-warning", linkClass: "link-warning", textClass: "text-warning"      },
  { label: 'Unstarted',   badge: "badge-primary", linkClass: "link-primary", textClass: "text-primary dark:text-primary-content" },
  { label: 'Active',      badge: "badge-accent",  linkClass: "link-accent",  textClass: "text-accent-content dark:text-accent"   },
  { label: 'Finished',    badge: "badge-ghost",   linkClass: "",             textClass: "text-base-content" },
  { label: 'N/A',         badge: "badge-warning", linkClass: "link-warning", textClass: "text-warning"      },
];

export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const roundButtonText = {
  none: "",
  begin: "Start Event",
  end: "End Event",
  back: "Delete Round",
  next: "Next Round",
  wait: "Awaiting Report",
  done: "Event Complete",
};

// Local var keys
export const localKeys = {
  session: 'tt-session',
};

// Lock Screen captions
export const roundButtonLockCaption = "Generating round...";
export const editEventLockCaptions = ["Creating event...", "Updating event..."];
export const playerLockCaption = "Creating player...";
export const resetDataLockCaption = "Resetting data...";
export const reportLockCaption = "Updating standings...";


// -- Server error adapters -- \\

// Data to extract from form element for error message
export const formErrorData = ({ min, max, minLength, maxLength, value, id }) => ({ min, max, minLength, maxLength, value, id })

export const formErrorMessages = {
  min: basicTemplate`Must have at least ${'min'} ${'label'}.`,
  max: basicTemplate`Can't have more than ${'max'} ${'label'}.`,
  minLength: basicTemplate`${'label'} should be at least ${'minLength'} characters.`,
  maxLength: basicTemplate`${'label'} can't be more than ${'maxLength'} characters.`,
}


// FORMAT = endpoint: (arg) => `Endpoint ${arg}`,
export const errorTitle = {
  default: "Error",
}

// FORMAT = msg/TEXT_STATUS: (arg) => `New msg ${arg}.`,
export const errorMessage = {
  default: "An unknown server error occurred.",
  PARSING_ERROR: (msg) => "Server is not responding: "+(msg || "Unknown error."),
}