export const WOBJECT_REF = '/object/([a-z0-9-]*)';

export const HOSTS_TO_PARSE_LINKS = [
  'waivio.com',
  'dining.gifts',
  'waiviodev.com',
  'dinings.club',
];

export const REGEX_WOBJECT_REF = new RegExp(
  `${HOSTS_TO_PARSE_LINKS.map((el) => `${el}${WOBJECT_REF}`).join('|')}`,
);

export const REGEX_MENTIONS = new RegExp(`@[\w.-]+`);
