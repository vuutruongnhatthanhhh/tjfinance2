export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl">💰</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text">TJFinance</h1>
          <p className="mt-1 text-sm text-text-muted">Quản lý chi tiêu và đầu tư cá nhân của bạn</p>
        </div>
        {children}
      </div>
    </div>
  );
}
