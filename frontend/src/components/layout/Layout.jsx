import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileTabBar from './MobileTabBar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Topbar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}