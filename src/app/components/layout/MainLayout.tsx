import Header from './Header';
import ToastContainer from '../ui/ToastContainer';
import LiveMarketTicker from '../features/LiveMarketTicker';
import OfflineFieldModeBanner from '../features/OfflineFieldModeBanner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-agro-branco dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-150">
      <Header />
      <OfflineFieldModeBanner />
      <LiveMarketTicker />
      <main className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
};

export default MainLayout;