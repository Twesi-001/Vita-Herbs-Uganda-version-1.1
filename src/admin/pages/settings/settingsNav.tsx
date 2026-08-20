import { KeyRound } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SettingsLeaf {
  label: string;
  path: string;
  icon: ReactNode;
  description?: string;
}

export interface SettingsGroup {
  label: string;
  items: SettingsLeaf[];
}

/**
 * Settings sub-navigation. Grouped from the start so the sections that come
 * next (email delivery, site preferences) have an obvious home.
 */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    label: 'General',
    items: [
      {
        label: 'Account',
        path: '/admin/settings/account',
        icon: <KeyRound size={16} />,
        description: 'Your admin sign-in details.',
      },
    ],
  },
];
