import * as _ from 'lodash';

export interface GetBodyLinksArrayInterface {
  body: string;
  regularExpression: RegExp;
}

export const getBodyLinksArray = ({
  body,
  regularExpression,
}: GetBodyLinksArrayInterface): string[] =>
  _.chain(body.match(new RegExp(regularExpression, 'gm')))
    .reduce(
      (acc, link) => [...acc, _.compact(link.match(regularExpression))[1]],
      [],
    )
    .compact()
    .value();

export const extractLinks = (text: string): string[] => {
  const urlPattern = /https?:\/\/[^\s/$.?#].[^\s)"]*/gm;
  const links = text.match(urlPattern);
  return links ? links : [];
};

const isFileLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const fileRegex = /[^\/]+\.[a-zA-Z0-9]+$/;

    return fileRegex.test(pathname);
  } catch (e) {
    // If the URL is invalid, return false
    return false;
  }
};

export const findPossibleLinks = (url: string): string[] => {
  try {
    if (isFileLink(url)) return [];
    const links = [];
    const pattern = new URL(url);
    const path = pattern.pathname.split('/');
    links.push(url);
    links.push(`${pattern.origin}*`);

    let dynamicUrl = pattern.origin;

    for (const pathName of path) {
      if (!pathName) continue;
      dynamicUrl = `${dynamicUrl}/${pathName}`;
      links.push(`${dynamicUrl}*`);
    }
    return links;
  } catch (e) {
    return [];
  }
};

export const getOrigin = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin;
  } catch (error) {
    return '';
  }
};
