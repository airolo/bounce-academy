import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <AlertTriangle className="mx-auto mb-4 text-brand-500" size={40} />
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-slate-600">Please try again. Your session is safe.</p>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
              onClick={this.handleReset}
              type="button"
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
