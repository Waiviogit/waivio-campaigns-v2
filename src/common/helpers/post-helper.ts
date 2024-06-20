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
  const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/gm;
  const links = text.match(urlPattern);
  return links ? links : [];
};

export const getOrigin = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin;
  } catch (error) {
    return '';
  }
};
