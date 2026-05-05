"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/ledger", label: "📒 간편장부" },
  { href: "/deduction", label: "💰 공제 데이터" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <div className="bg-white border-b border-gray-200 shrink-0 flex">
      {navItems.map(({ href, label }) => {
        const isActive = pathname === href || (pathname === "/" && href === "/ledger");
        return (
          <Link key={href} href={href}
            className={`flex-1 py-2.5 text-center text-[12px] font-semibold border-b-2 transition-colors ${
              isActive ? "border-[#0064FF] text-[#0064FF] bg-blue-50/40" : "border-transparent text-gray-400"
            }`}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
