import { ReactNode } from "react";
import { RootNavbarShellClient } from "./RootNavbarShellClient";

interface RootNavbarShellProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export function RootNavbarShell({ children, navbar, footer }: RootNavbarShellProps) {
  return (
    <RootNavbarShellClient navbar={navbar} footer={footer}>
      {children}
    </RootNavbarShellClient>
  );
}
