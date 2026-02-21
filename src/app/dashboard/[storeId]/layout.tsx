import StoreNav from "@/components/StoreNav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <StoreNav />
      {children}
    </div>
  );
}
