import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Admin dashboard pages are authenticated and data-driven: they must render at
// request time, never be statically prerendered at build. This also prevents
// the production build from depending on database/network availability.
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
