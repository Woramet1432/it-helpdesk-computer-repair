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

// Public Portal Components
import { PublicNavbar, PublicActiveTab } from './pages/PublicPortal/PublicNavbar.tsx';
import { PublicHome } from './pages/PublicPortal/PublicHome.tsx';
import { PublicNewTicket } from './pages/PublicPortal/PublicNewTicket.tsx';
import { PublicTrackTicket } from './pages/PublicPortal/PublicTrackTicket.tsx';
import { PublicGuide } from './pages/PublicPortal/PublicGuide.tsx';
import { StaffLoginModal } from './pages/PublicPortal/StaffLoginModal.tsx';

import { api } from './services/api.ts';
import { RefreshCw, Wrench } from 'lucide-react';
import { TicketCategory } from './types/index.ts';

const MainApp: React.FC = () => {
  const { user, loading, isStaff } = useAuth();

  // Mode: 'public' (default for unauthenticated guests) or 'portal' (when staff/user works in dashboard)
  const [viewMode, setViewMode] = useState<'public' | 'portal'>('public');

  // Public portal state
  const [publicTab, setPublicTab] = useState<PublicActiveTab>('home');
  const [publicPrefill, setPublicPrefill] = useState<{ category?: TicketCategory; symptom?: string; requestType?: 'incident' | 'request' } | undefined>();
  const [trackParams, setTrackParams] = useState<{ ticketNumber?: string; trackingCode?: string }>({});
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);

  // Portal (logged-in) state
  const [activePage, setActivePage] = useState<ActivePage>('admin_dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTicketCount, setNewTicketCount] = useState(0);

  // When user logs in, default to portal mode
  useEffect(() => {
    if (user) {
      setViewMode('portal');
      if (user.role === 'admin' || user.role === 'technician') {
        setActivePage('admin_dashboard');
        api.getTickets({ status: 'new' })
          .then((data) => setNewTicketCount(data.length))
          .catch(console.error);
      } else {
        setActivePage('user_dashboard');
      }
    } else {
      setViewMode('public');
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

  // PUBLIC PORTAL VIEW (For guests or staff reviewing public view)
  if (!user || viewMode === 'public') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased">
        <PublicNavbar
          activeTab={publicTab}
          onNavigate={(tab) => {
            setPublicTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenStaffLogin={() => setShowStaffLoginModal(true)}
          onGoToStaffDashboard={user ? () => setViewMode('portal') : undefined}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {publicTab === 'home' && (
            <PublicHome
              onNavigateNewTicket={(prefill) => {
                setPublicPrefill(prefill);
                setPublicTab('new_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateTrackTicket={(ticketNumber) => {
                setTrackParams({ ticketNumber });
                setPublicTab('track_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateGuide={() => {
                setPublicTab('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {publicTab === 'new_ticket' && (
            <PublicNewTicket
              initialCategory={publicPrefill?.category}
              initialSymptom={publicPrefill?.symptom}
              initialRequestType={publicPrefill?.requestType}
              onBack={() => setPublicTab('home')}
              onNavigateTrackTicket={(ticketNumber, trackingCode) => {
                setTrackParams({ ticketNumber, trackingCode });
                setPublicTab('track_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {publicTab === 'track_ticket' && (
            <PublicTrackTicket
              initialTicketNumber={trackParams.ticketNumber}
              initialTrackingCode={trackParams.trackingCode}
              onBack={() => setPublicTab('home')}
              onNavigateNewTicket={() => {
                setPublicPrefill(undefined);
                setPublicTab('new_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {publicTab === 'guide' && (
            <PublicGuide
              onNavigateNewTicket={() => {
                setPublicPrefill(undefined);
                setPublicTab('new_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateTrackTicket={() => {
                setPublicTab('track_ticket');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <div className="font-semibold text-slate-700">
              ระบบแจ้งซ่อมคอมพิวเตอร์ & บริการไอที (IT Helpdesk System)
            </div>
            <div>
              ฝ่ายเทคโนโลยีสารสนเทศ • เปิดทำการวันจันทร์ - ศุกร์ 08:30 - 17:30 น. • สายด่วนโทร 100, 101, 102
            </div>
          </div>
        </footer>

        {/* Staff Login Modal */}
        <StaffLoginModal
          isOpen={showStaffLoginModal}
          onClose={() => setShowStaffLoginModal(false)}
          onSuccess={() => {
            setShowStaffLoginModal(false);
            setViewMode('portal');
          }}
        />
      </div>
    );
  }

  // LOGGED-IN STAFF / USER PORTAL VIEW
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSwitchToPublicPortal={() => setViewMode('public')}
      />

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

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={showStaffLoginModal}
        onClose={() => setShowStaffLoginModal(false)}
        onSuccess={() => {
          setShowStaffLoginModal(false);
          setViewMode('portal');
        }}
      />
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
