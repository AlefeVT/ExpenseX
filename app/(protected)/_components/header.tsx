'use client';
import Link from 'next/link';
import { useState } from 'react';
import { UserButton } from '@/components/auth/user-button';
import { RoleGate } from '@/components/auth/role-gate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoMdList } from 'react-icons/io';
import { InitialLogo } from '@/components/logo/logo';

const menuItems = [
  // { href: "/server", label: "Server", roles: ["ADMIN"] },
  // { href: "/client", label: "Client", roles: ["ADMIN"] },
  // { href: "/admin", label: "Admin", roles: ["ADMIN"] },
  {
    href: '/item',
    label: 'Cadastros',
    roles: ['ADMIN'],
    submenu: [{ href: '/item', label: 'Itens', icon: IoIosAddCircleOutline }],
  },
  {
    href: '/loan',
    label: 'Solicitações',
    roles: ['USER', 'ADMIN'],
    submenu: [{ href: '/loan', label: 'Empréstimo', icon: IoMdList }],
  },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center p-2 shadow-sm z-55 overflow-x-hidden overflow-y-hidden w-full bg-gray-700">
        <div className="flex justify-between w-full sm:w-auto">
          <div className="flex items-center">
            <div
              className="cursor-pointer sm:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="w-6 h-6 text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </div>

            <Link
              href={'/dashboard'}
              className="flex items-center px-12 ml-2 py-3 rounded-md h-20 text-white"
            >
              {/* <Image src="/logo.svg" alt="Logoo" height={110} width={110} /> */}
              <InitialLogo />
            </Link>
          </div>
          <UserButton className="flex items-center gap-2 sm:hidden mr-7" />
        </div>
        <UserButton className="hidden sm:flex items-center gap-2 mr-7" />
      </div>

      <nav className="border-b border-border py-4 px-16">
        <div
          className={`flex-col ${isOpen ? 'flex' : 'hidden'} sm:flex sm:flex-row gap-y-4 items-center gap-x-2 w-full mt-4 sm:mt-0 `}
        >
          {menuItems.map((item) => (
            <RoleGate key={item.href} allowedRoles={item.roles}>
              <div className="mx-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Label className="flex gap-2">
                      {item.label} <IoMdArrowDropdown />
                    </Label>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {item.submenu &&
                        item.submenu.map((subItem) => (
                          <DropdownMenuItem key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className="flex gap-2 items-center w-full"
                            >
                              <subItem.icon className="mr-2" /> {subItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RoleGate>
          ))}
        </div>
      </nav>
    </>
  );
};
