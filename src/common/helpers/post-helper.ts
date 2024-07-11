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

export const getMentionsFromPost = (body: string): string[] => {
  // Regular expression to match URLs
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gm;
  const emailRegex = /[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/gm;

  // Remove URLs from the body
  const bodyWithoutUrls = body.replace(urlRegex, '').replace(emailRegex, '');

  // Extract mentions from the remaining text
  const mentions = bodyWithoutUrls.match(/@[a-z0-9._-]+/gm);

  return _.uniq(
    _.compact(
      _.map(mentions, (mention) => {
        // mention = mention.slice(1); // Remove the first '@' symbol from each mention
        const parts = mention.split('.');
        let processedMention;
        if (parts.length > 1 && parts[1].length >= 3) {
          processedMention = mention;
        } else {
          processedMention = parts[0];
        }
        // Remove any trailing dot
        processedMention = processedMention.replace(/\.$/, '');
        // Ensure minimum length of 3 characters
        return processedMention.length >= 3 ? processedMention : null;
      }),
    ),
  );
};

export const extractLinks = (text: string): string[] => {
  const urlPattern = /https?:\/\/[^\s/$.?#].[^\s)"]*/gm;
  const links = text.replace(/\\:/gm, ':').match(urlPattern);
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
