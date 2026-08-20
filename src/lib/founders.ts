import jimmyImg from '../assets/founder-jimmy.jpeg';
import immaculateImg from '../assets/founder-immaculate.jpeg';

export type Founder = {
  name: string;
  role: string;
  location: string;
  bio: string;
  photo: string;
  phones: string[];
};

/**
 * What the founders carousel shows before anything has been saved in the
 * admin panel. Shared with the admin Site Content page so its fields open
 * pre-filled with the copy that is actually live, rather than blank.
 */
export const FOUNDER_DEFAULTS: Founder[] = [
  {
    name: 'Mr. Katumba Jimmy',
    role: 'Founder & CEO',
    location: 'Kampala, Uganda',
    bio: "Jimmy founded KarOrganics Uganda with a passion for preserving Uganda's rich herbal heritage. He leads the company's vision to make natural wellness accessible to every household.",
    photo: jimmyImg,
    phones: ['0701924517', '0785219136'],
  },
  {
    name: 'Ms. Natukunda Immaculate',
    role: 'Co-Founder',
    location: 'Kampala, Uganda',
    // Placeholder: says only what is known - that she is a co-founder.
    // Replace with her real remit from the admin panel's Description field.
    bio: "Immaculate is a co-founder of KarOrganics Uganda, helping build the company behind its range of natural herbal products.",
    photo: immaculateImg,
    phones: ['+256 758 884808'],
  },
];

export const FOUNDERS_HEADING = 'Meet Our Founders';
export const FOUNDERS_SUBTEXT =
  'The passionate people behind KarOrganics Uganda - dedicated to bringing you the finest herbal products from the heart of East Africa.';

/** Content key for a founder field, e.g. `founders.1.name`. */
export function founderKey(index: number, field: string): string {
  return `founders.${index + 1}.${field}`;
}

/** The `founders.*` content keys mapped to their built-in default values. */
export const FOUNDER_DEFAULT_CONTENT: Record<string, string> = Object.fromEntries(
  FOUNDER_DEFAULTS.flatMap((f, i) => [
    [founderKey(i, 'photo'), f.photo],
    [founderKey(i, 'name'), f.name],
    [founderKey(i, 'role'), f.role],
    [founderKey(i, 'location'), f.location],
    [founderKey(i, 'phone1'), f.phones[0] ?? ''],
    [founderKey(i, 'phone2'), f.phones[1] ?? ''],
    [founderKey(i, 'bio'), f.bio],
  ]),
);
