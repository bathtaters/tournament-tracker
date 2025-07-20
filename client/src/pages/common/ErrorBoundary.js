import { Component } from "react";
import ErrorStyle from "./styles/ErrorStyle";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };

    // Catch Async errors
    this.asyncHandler = (event) => {
      this.setState({
        error: event.reason.message || event.reason || "Unknown Async Error",
        errorInfo: event.reason,
      });
      // You can also log error messages to an error reporting service here
    };
  }

  // Listen for Async Errors
  componentDidMount() {
    window.addEventListener("unhandledrejection", this.asyncHandler);
  }

  // Cleanup listener
  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.asyncHandler);
  }

  // Catch errors in any child components
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    // Normally, just render children
    if (!this.state.errorInfo) return this.props.children;

    // Render Error
    return (
      <ErrorStyle title="Something went wrong.">
        {this.state.error && this.state.error.toString()}
        <br /> <br />
        {this.state.errorInfo.componentStack ||
          this.state.errorInfo.stack ||
          this.state.errorInfo.toString()}
      </ErrorStyle>
    );
  }
}

export default ErrorBoundary;
