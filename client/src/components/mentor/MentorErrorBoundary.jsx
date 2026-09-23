import React from "react";
import FallbackMentor from "./FallbackMentor";

export class MentorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log full error details so we can debug — do NOT silently swallow
    console.error("[LivingMentor] WebGL boundary caught error:", error?.message || error);
    console.error("[LivingMentor] Component stack:", errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackMentor
          currentState={this.props.currentState || "IDLE"}
          statusMessage={this.props.statusMessage}
          size={this.props.size || "md"}
        />
      );
    }
    return this.props.children;
  }
}

export default MentorErrorBoundary;
