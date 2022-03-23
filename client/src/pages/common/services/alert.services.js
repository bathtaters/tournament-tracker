import { render } from "react-dom";

// Render into root separate root to allow Alerts on top of modals
const alertRoot = document.getElementById('alert-root');

// Open Alert
export const openAsPromise = (Alert) => (message, buttons = ["Ok"], title = "Warning!") =>
  new Promise((resolve) =>
    render(<Alert message={message} title={title} buttons={buttons} callback={resolve} />, alertRoot)
  )

// Close Alert
export const clickHandler = (callback) => (buttonValue) => {
  callback(buttonValue); // execute callback
  render(null, alertRoot); // clear alert
}