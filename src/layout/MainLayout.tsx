import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen p-3">
            <header className="w-full flex justify-center gap-4">
                <img className="w-10 h-10" src="/logo.png" alt="Logo ACM" />
                <h1 className="text-primary flex flex-col justify-center">
                    <span className="font-bold">American Corner</span>
                    <span className="uppercase">Mahajanga</span>
                </h1>
            </header>

            <main className="flex flex-col w-full items-center p-6">
                {children}
            </main>

            <footer className="absolute bottom-3 left-1/2 -translate-x-1/2 flex ">
                <p>
                    &copy; Copyright {new Date(Date.now()).getFullYear()} - Alll
                    rights reserved
                </p>
            </footer>
        </div>
    );
}
