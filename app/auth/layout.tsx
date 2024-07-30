const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center light:bg-gray-300">
      {children}
    </div>
  );
};

export default AuthLayout;
