import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import DemoPage from './DemoPage';

const rootRoute = createRootRoute({
  component: () => (
    <main style={{ fontFamily: 'sans-serif', padding: '1.5rem' }}>
      <h1>Lit Auth TanStack Demo</h1>
      <Outlet />
    </main>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DemoPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
