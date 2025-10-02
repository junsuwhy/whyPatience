/**
 * T035: App Root Component with Providers
 *
 * Main application component that serves as the root of the Solitaire application.
 * Responsibilities:
 * - Mount global providers (DndProvider, future GameState context, statistics hooks)
 * - Establish basic layout structure (Header/Main/Footer with ARIA landmarks)
 * - Integrate GameBoard (T034 completed) and prepare for future hooks
 *   (T036 useGameState, T037 useDragAndDrop, T038 useLocalStorage, T039 useGameStatistics)
 * - Support accessibility (semantic tags, focus order, keyboard navigation, Skip to Content link)
 * - Comply with Constitution principles: Code Quality, TDD, UX Consistency, Performance
 */

import {
  useEffect,
  useRef,
  Component,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { GameBoard } from './components/GameBoard';

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a5f3f 0%, #2d8659 100%);
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;

  &:focus {
    top: 0;
  }
`;

const AppHeader = styled.header`
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const AppDescription = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const AppMain = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const AppFooter = styled.footer`
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  font-size: 0.875rem;
`;

// Error Boundary Component (placeholder for future enhancement)
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    // TODO: Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page to try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App Component
 * Integrates all providers and establishes the application structure
 */
function App() {
  const mainRef = useRef<HTMLElement>(null);

  // Focus management: send focus to main content on mount
  useEffect(() => {
    const focusTimeout = window.setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.focus();
      }
    }, 100);

    return () => window.clearTimeout(focusTimeout);
  }, []);

  return (
    <ErrorBoundary>
      {/* TODO: Future providers to be added here
          - GameStateProvider (T036 useGameState)
          - StatisticsProvider (T039 useGameStatistics)
          These will wrap DndProvider when implemented
      */}
      <DndProvider backend={HTML5Backend}>
        <AppContainer>
          {/* Skip to main content link for accessibility */}
          <SkipLink href="#main" className="skip-link">
            跳到主要內容 (Skip to main content)
          </SkipLink>

          <AppHeader role="banner">
            <AppTitle aria-label="Desktop Solitaire - Classic Card Game">
              Desktop Solitaire
            </AppTitle>
            <AppDescription>
              Classic card game built with React and TypeScript
            </AppDescription>
          </AppHeader>

          <AppMain
            id="main"
            ref={mainRef}
            role="main"
            aria-label="Game area"
            tabIndex={-1}
          >
            {/* TODO: Connect game state (T040) - currently using GameBoard's internal state */}
            <GameBoard />
          </AppMain>

          <AppFooter role="contentinfo">
            <p>
              © 2025 Desktop Solitaire | Built with React 18+ and TypeScript
            </p>
          </AppFooter>
        </AppContainer>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;
