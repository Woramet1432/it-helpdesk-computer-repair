import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, ActivePage } from './components/layout/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { UserDashboard } from './pages/UserPortal/UserDashboard.tsx';
import { NewTicketPage } from './pages/UserPortal/NewTicketPage.tsx';
import { TicketDetailPage } from './pages/UserPortal/TicketDetailPage.tsx';
import { UserTicketHistory } from './pages/UserPortal/UserTicketHistory.tsx';
import { AdminDashboard } from './pages/AdminPortal/AdminDashboard.tsx';
import { TicketManagementPage } from './pages/AdminPortal/TicketManagementPage.tsx';
import { AdminTicketDetailPage } from './pages/AdminPortal/AdminTicketDetailPage.tsx';
import { AssetManagementPage } from './pages/AdminPortal/AssetManagementPage.tsx';
import { UserManagementPage } from './pages/AdminPortal/UserManagementPage.tsx';
import { ReportsPage } from './pages/AdminPortal/ReportsPage.tsx';
import { AuditLogPage } from './pages/AdminPortal/AuditLogPage.tsx';
import { api } from './services/api.ts';
import { RefreshCw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, isStaff } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('user_dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global counts for badges
  const [newTicketCount, setNewTicketCount] = useState(0);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'technician') {
        setActivePage('admin_dashboard');
      } else {
        setActivePage('user_dashboard');
      }

      // Fetch new tickets count for staff
      if (user.role === 'admin' || user.role === 'technician') {
        api.getTickets({ status: 'new' })
          .then((data) => setNewTicketCount(data.length))
          .catch(console.error);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <div className="text-sm font-semibold tracking-wide">
          กำลังเตรียมความพร้อมระบบ IT Helpdesk...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSelectUserTicket = (id: number) => {
    setSelectedTicketId(id);
    setActivePage('user_dashboard'); // use state or dedicated detail view
  };

  const handleSelectAdminTicket = (id: number) => {
    setSelectedTicketId(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setSelectedTicketId(null);
            setActivePage(page);
          }}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          newTicketCount={newTicketCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Detail Views if a ticket is selected */}
          {selectedTicketId !== null ? (
            isStaff && (activePage === 'admin_dashboard' || activePage === 'admin_tickets') ? (
              <AdminTicketDetailPage
                ticketId={selectedTicketId}
                onBack={() => setSelectedTicketId(null)}
              />
            ) : (
              <TicketDetailPage
                ticketId={selectedTicketId}
                onBack={() => setSelectedTicketId(null)}
              />
            )
          ) : (
            <>
              {activePage === 'user_dashboard' && (
                <UserDashboard
                  onNavigateNewTicket={() => setActivePage('new_ticket')}
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                  onNavigateHistory={() => setActivePage('my_tickets')}
                />
              )}

              {activePage === 'new_ticket' && (
                <NewTicketPage
                  onBack={() => setActivePage('user_dashboard')}
                  onSuccess={(id) => {
                    setSelectedTicketId(id);
                  }}
                />
              )}

              {activePage === 'my_tickets' && (
                <UserTicketHistory
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                  onNavigateNewTicket={() => setActivePage('new_ticket')}
                />
              )}

              {activePage === 'admin_dashboard' && (
                <AdminDashboard
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                  onNavigateTickets={() => setActivePage('admin_tickets')}
                  onNavigateReports={() => setActivePage('reports')}
                />
              )}

              {activePage === 'admin_tickets' && (
                <TicketManagementPage
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                />
              )}

              {activePage === 'assets' && <AssetManagementPage />}

              {activePage === 'users' && <UserManagementPage />}

              {activePage === 'reports' && <ReportsPage />}

              {activePage === 'audit_logs' && <AuditLogPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
