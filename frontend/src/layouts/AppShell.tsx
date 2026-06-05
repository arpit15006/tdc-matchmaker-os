import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const location = useLocation();
  // Key on the path WITHOUT query so tab changes (?tab=) don't retrigger transitions.
  const pageKey = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-ambient">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {/*
              Keyed enter-only transition. We intentionally avoid
              AnimatePresence + mode="wait" here: on client navigation it can
              strand the incoming page at its initial (opacity 0) state until a
              refresh. A keyed motion.div always settles at opacity 1 on mount.
            */}
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
