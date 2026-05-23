"use client";

import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";

import { MobileSidebar } from "./mobile-sidebar";

const pathnameMap = {
  "tasks": {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  "projects": {
    title: "My Project",
    description: "View tasks of your project here"
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks here",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-3 pb-2 px-3 sm:pt-4 sm:px-6 flex items-center justify-between border-b border-border/50">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-xl xl:text-2xl font-semibold">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {/* Mobile: show title inline with menu button */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar />
        <span className="text-base font-semibold">{title}</span>
      </div>
      <UserButton />
    </nav>
  );
};
