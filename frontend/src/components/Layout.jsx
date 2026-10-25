import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <Navbar />
      <main className="ml-[260px] mt-16 p-container-padding flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
