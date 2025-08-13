import React from 'react';
import DashboardOverview from './pages/DashboardOverview';
import TasksContent from './pages/TasksContent';
import ScheduleContent from './pages/ScheduleContent';
import PerformanceContent from './pages/PerformanceContent';
import ProfileContent from './pages/ProfileContent';
import ServicesContent from './pages/ServicesContent';
import WorkHistoryContent from './pages/WorkHistoryContent';
import EarningsContent from './pages/EarningsContent';
import PaymentVerificationContent from './pages/PaymentVerificationContent';
import NotificationsContent from './pages/NotificationsContent';
import HelpSupportContent from './pages/HelpSupportContent';
import SettingsContent from './pages/SettingsContent';

const WorkerContent = ({ 
  activeTab, 
  serviceRequests, 
  workerStats, 
  availability, 
  setAvailability,
  notifications,
  onAcceptRequest,
  onCompleteRequest,
  onRejectRequest 
}) => {

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            workerStats={workerStats}
            availability={availability}
            setAvailability={setAvailability}
            notifications={notifications}
          />
        );
      case 'tasks':
        return (
          <TasksContent
            serviceRequests={serviceRequests}
            onAcceptRequest={onAcceptRequest}
            onCompleteRequest={onCompleteRequest}
            onRejectRequest={onRejectRequest}
          />
        );
      case 'schedule':
        return (
          <ScheduleContent
            serviceRequests={serviceRequests}
            availability={availability}
          />
        );
      case 'performance':
        return (
          <PerformanceContent
            workerStats={workerStats}
          />
        );
      case 'profile':
        return <ProfileContent />;
      case 'services':
        return (
          <ServicesContent
            serviceRequests={serviceRequests}
          />
        );
      case 'history':
        return (
          <WorkHistoryContent
            serviceRequests={serviceRequests}
          />
        );
      case 'earnings':
        return (
          <EarningsContent
            workerStats={workerStats}
            serviceRequests={serviceRequests}
          />
        );
      case 'payments':
        return <PaymentVerificationContent />;
      case 'notifications':
        return (
          <NotificationsContent
            notifications={notifications}
          />
        );
      case 'help':
        return <HelpSupportContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return (
          <DashboardOverview
            workerStats={workerStats}
            availability={availability}
            setAvailability={setAvailability}
            notifications={notifications}
          />
        );
    }
  };

  return (
    <div className="worker-content">
      {renderContent()}
    </div>
  );
};

export default WorkerContent;
