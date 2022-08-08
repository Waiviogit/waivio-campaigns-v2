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
