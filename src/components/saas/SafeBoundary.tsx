import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; label?: string }
interface State { error: Error | null }

/** Lightweight runtime error boundary. Renders fallback UI on render-time errors. */
export class SafeBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") {
      console.error(`[SafeBoundary${this.props.label ? `:${this.props.label}` : ""}]`, error);
    }
  }
  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-destructive">
            Section unavailable
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We hit a temporary issue rendering this section. Please refresh the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
