
export const dragType = { event: "json/eventday", player: "json/matchplayer" };

export const statusInfo = [
  {label: 'N/A', class: "dim-color"},
  {label: 'Not Started', class: "max-color"},
  {label: 'Active', class: "neg-color"},
  {label: 'Complete', class: "pos-color"},
  {label: 'N/A', class: "dim-color"},
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


// -- Server error adapters -- \\

// FORMAT = endpoint: (arg) => `Endpoint ${arg}`,
export const errorTitle = {
  default: "Error",
}

// FORMAT = msg/TEXT_STATUS: (arg) => `New msg ${arg}.`,
export const errorMessage = {
  default: "An unknown server error occurred.",
  PARSING_ERROR: (msg) => "Server is not responding: "+(msg || "Unknown error."),
}