import {
  FileEdit, KeyRound, LayoutDashboard, MessageSquare, Package, Plus, Star, Users,
  Video as VideoIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Stats } from './types';

/** Which stat count, if any, shows as a badge next to the item. */
export type BadgeKey = keyof Stats;

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: BadgeKey;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={19} /> }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', path: '/admin/products', icon: <Package size={19} />, badge: 'products' },
      { label: 'Create Product', path: '/admin/products/new', icon: <Plus size={19} /> },
      { label: 'Videos', path: '/admin/videos', icon: <VideoIcon size={19} />, badge: 'videos' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Inquiries', path: '/admin/inquiries', icon: <MessageSquare size={19} />, badge: 'contacts' },
      { label: 'Reviews', path: '/admin/reviews', icon: <Star size={19} />, badge: 'reviews' },
      { label: 'Subscribers', path: '/admin/subscribers', icon: <Users size={19} />, badge: 'subscribers' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Site Content', path: '/admin/content', icon: <FileEdit size={19} /> },
      { label: 'Account', path: '/admin/settings/account', icon: <KeyRound size={19} /> },
    ],
  },
];

/**
 * Of all nav paths matching the URL, the longest wins — so /admin/products/new
 * lights "Create Product", while /admin/products/5/edit still lights "Products".
 * Plain NavLink `isActive` can't express that, since both would match.
 */
export function mostSpecificMatch(pathname: string): string | undefined {
  return NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.path))
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
}
