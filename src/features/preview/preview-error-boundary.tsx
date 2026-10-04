import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className='rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'>
          <p className='font-medium'>The preview crashed</p>
          <p className='mt-1 font-mono text-xs'>{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
