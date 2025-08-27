'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  workspaces: any[];
}

export default function Sidebar({ workspaces }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white h-screen p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4">Workspaces</h2>
      <nav>
        <ul className="space-y-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link
                href={`/workspace/${workspace.id}`}
                className={`block p-2 rounded ${
                  pathname === `/workspace/${workspace.id}`
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {workspace.name}
                <span className="text-sm block text-gray-500">
                  {workspace.workspace_members[0]?.role}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4">
        <Link
          href="/workspace"
          className={`block p-2 rounded ${
            pathname === '/workspace' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Manage Workspaces
        </Link>
      </div>
    </aside>
  );
}