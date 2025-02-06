interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen w-full">
      {children}
      <img
        src="https://i.imgur.com/bCzbqhq.png"
        alt="Background"
        className="fixed bottom-0 right-0 w-[500px] h-auto opacity-10 pointer-events-none z-0"
      />
    </div>
  )
}

