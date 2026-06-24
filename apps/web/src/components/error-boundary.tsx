import { Component, type ReactNode, type ErrorInfo } from "react";
import * as Sentry from "@sentry/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }

  reset = () => this.setState({ hasError: false, errorMessage: "" });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-white dark:bg-slate-950">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
            {this.state.errorMessage || "An unexpected error occurred."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.reset}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Try again
            </button>
            <a href="/d" className={cn(buttonVariants())}>
              Go to diagrams
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
