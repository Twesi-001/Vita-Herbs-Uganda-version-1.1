import { Heart, Home, ListChecks, Share2, Sparkles, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { FOUNDER_DEFAULT_CONTENT, FOUNDERS_HEADING, FOUNDERS_SUBTEXT } from '../../../lib/founders';

export type ContentFieldType = 'input' | 'textarea' | 'image' | 'richtext';

export interface ContentField {
  key: string;
  label: string;
  type: ContentFieldType;
  group?: string;
  /** Shown in the editor when the key has never been saved, so the field
      opens with the copy the website is actually serving. */
  defaultValue?: string;
}

export interface ContentSection {
  title: string;
  desc: string;
  icon: ReactNode;
  fields: ContentField[];
}

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    title: 'Hero Section',
    desc: 'The first thing visitors see on the home page.',
    icon: <Home size={18} />,
    fields: [
      { key: 'hero.eyebrow', label: 'Eyebrow label', type: 'input' },
      { key: 'hero.heading', label: 'Main heading', type: 'input' },
      { key: 'hero.subtext', label: 'Subtext paragraph', type: 'richtext' },
    ],
  },
  {
    title: 'About Page',
    desc: 'Your story, heritage and the three pillars.',
    icon: <Sparkles size={18} />,
    fields: [
      { key: 'about.hero.eyebrow', label: 'Eyebrow', type: 'input', group: 'Page Header' },
      { key: 'about.hero.heading', label: 'Heading', type: 'input', group: 'Page Header' },
      { key: 'about.hero.description', label: 'Description', type: 'richtext', group: 'Page Header' },
      { key: 'about.story.eyebrow', label: 'Eyebrow', type: 'input', group: 'Heritage Story' },
      { key: 'about.story.heading', label: 'Heading', type: 'input', group: 'Heritage Story' },
      { key: 'about.story.body', label: 'Body text', type: 'richtext', group: 'Heritage Story' },
      { key: 'about.story.body2', label: 'Second paragraph', type: 'richtext', group: 'Heritage Story' },
      { key: 'about.story.image', label: 'Heritage image (first)', type: 'image', group: 'Heritage Story' },
      { key: 'about.story.image2', label: 'Heritage image (second)', type: 'image', group: 'Heritage Story' },
      { key: 'about.pillar1.title', label: 'Title', type: 'input', group: 'Pillar 1' },
      { key: 'about.pillar1.body', label: 'Body', type: 'input', group: 'Pillar 1' },
      { key: 'about.pillar2.title', label: 'Title', type: 'input', group: 'Pillar 2' },
      { key: 'about.pillar2.body', label: 'Body', type: 'input', group: 'Pillar 2' },
      { key: 'about.pillar3.title', label: 'Title', type: 'input', group: 'Pillar 3' },
      { key: 'about.pillar3.body', label: 'Body', type: 'input', group: 'Pillar 3' },
    ],
  },
  {
    title: 'Founders',
    desc: 'Photos, contacts and bios shown in the founders carousel on the home and about pages.',
    icon: <Users size={18} />,
    fields: [
      { key: 'founders.heading', label: 'Section heading', type: 'input', group: 'Section Intro', defaultValue: FOUNDERS_HEADING },
      { key: 'founders.subtext', label: 'Section subtext', type: 'input', group: 'Section Intro', defaultValue: FOUNDERS_SUBTEXT },
      { key: 'founders.1.photo', label: 'Photo', type: 'image', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.photo'] },
      { key: 'founders.1.name', label: 'Name', type: 'input', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.name'] },
      { key: 'founders.1.role', label: 'Role', type: 'input', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.role'] },
      { key: 'founders.1.location', label: 'Location', type: 'input', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.location'] },
      { key: 'founders.1.phone1', label: 'Contact 1', type: 'input', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.phone1'] },
      { key: 'founders.1.phone2', label: 'Contact 2 (optional)', type: 'input', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.phone2'] },
      { key: 'founders.1.bio', label: 'Description', type: 'richtext', group: 'Founder 1', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.1.bio'] },
      { key: 'founders.2.photo', label: 'Photo', type: 'image', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.photo'] },
      { key: 'founders.2.name', label: 'Name', type: 'input', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.name'] },
      { key: 'founders.2.role', label: 'Role', type: 'input', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.role'] },
      { key: 'founders.2.location', label: 'Location', type: 'input', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.location'] },
      { key: 'founders.2.phone1', label: 'Contact 1', type: 'input', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.phone1'] },
      { key: 'founders.2.phone2', label: 'Contact 2 (optional)', type: 'input', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.phone2'] },
      { key: 'founders.2.bio', label: 'Description', type: 'richtext', group: 'Founder 2', defaultValue: FOUNDER_DEFAULT_CONTENT['founders.2.bio'] },
    ],
  },
  {
    title: 'Why KarOrganics Section',
    desc: 'The "Trusted Herbal Products" block near the bottom of the About page.',
    icon: <Heart size={18} />,
    fields: [
      { key: 'about.why.eyebrow', label: 'Eyebrow', type: 'input', group: 'Section Intro' },
      { key: 'about.why.heading', label: 'Heading', type: 'input', group: 'Section Intro' },
      { key: 'about.why.body', label: 'Body text', type: 'richtext', group: 'Section Intro' },
      { key: 'about.why.item1', label: 'Item 1', type: 'input', group: 'Checklist' },
      { key: 'about.why.item2', label: 'Item 2', type: 'input', group: 'Checklist' },
      { key: 'about.why.item3', label: 'Item 3', type: 'input', group: 'Checklist' },
      { key: 'about.why.item4', label: 'Item 4', type: 'input', group: 'Checklist' },
      { key: 'about.why.item5', label: 'Item 5', type: 'input', group: 'Checklist' },
      { key: 'about.why.cta', label: 'Button label', type: 'input' },
      { key: 'about.why.image', label: 'Section image', type: 'image' },
    ],
  },
  {
    title: 'Why It Matters',
    desc: 'The value cards shown on the home page.',
    icon: <ListChecks size={18} />,
    fields: [
      { key: 'value.heading', label: 'Section heading', type: 'richtext', group: 'Section Intro' },
      { key: 'value.subtext', label: 'Subtext', type: 'richtext', group: 'Section Intro' },
      { key: 'value.bgImage', label: 'Background image', type: 'image' },
      { key: 'value.card1.title', label: 'Title', type: 'input', group: 'Card 1' },
      { key: 'value.card1.text', label: 'Text', type: 'richtext', group: 'Card 1' },
      { key: 'value.card2.title', label: 'Title', type: 'input', group: 'Card 2' },
      { key: 'value.card2.text', label: 'Text', type: 'richtext', group: 'Card 2' },
      { key: 'value.card4.title', label: 'Title', type: 'input', group: 'Card 3' },
      { key: 'value.card4.text', label: 'Text', type: 'richtext', group: 'Card 3' },
    ],
  },
  {
    title: 'Social Links',
    desc: 'Where your social buttons point to.',
    icon: <Share2 size={18} />,
    fields: [
      { key: 'social.whatsapp.url', label: 'WhatsApp URL', type: 'input' },
      { key: 'social.tiktok.url', label: 'TikTok URL', type: 'input' },
      { key: 'social.instagram.url', label: 'Instagram URL', type: 'input' },
      { key: 'social.facebook.url', label: 'Facebook URL', type: 'input' },
      { key: 'social.youtube.url', label: 'YouTube URL', type: 'input' },
    ],
  },
];

export type ContentBlock =
  | { kind: 'single'; field: ContentField }
  | { kind: 'group'; name: string; fields: ContentField[] };

/**
 * Bundles consecutive fields sharing a `group` label into one visual block, so
 * e.g. a pillar's title+body render together instead of as two anonymous rows.
 */
export function groupContentFields(fields: ContentField[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const field of fields) {
    const last = blocks[blocks.length - 1];
    if (field.group && last?.kind === 'group' && last.name === field.group) {
      last.fields.push(field);
    } else if (field.group) {
      blocks.push({ kind: 'group', name: field.group, fields: [field] });
    } else {
      blocks.push({ kind: 'single', field });
    }
  }
  return blocks;
}

/** Built-in defaults for every schema field that declares one. */
export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_SECTIONS.flatMap((s) =>
    s.fields.filter((f) => f.defaultValue).map((f) => [f.key, f.defaultValue as string]),
  ),
);
