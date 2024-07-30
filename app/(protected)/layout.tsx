import { ReactNode } from "react";
import Navbar from "./_components/Navbar";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar></Navbar>
      <div className="w-full">{children}</div>
    </div>
  )
}