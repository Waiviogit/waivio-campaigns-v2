export const WOBJECT_STATUS = Object.freeze({
  RELISTED: 'relisted',
  UNAVAILABLE: 'unavailable',
  NSFW: 'nsfw',
  FLAGGED: 'flagged',
});

export const ADMIN_ROLES = Object.freeze({
  ADMINISTRATIVE: 'administrative',
  OWNERSHIP: 'ownership',
  ADMIN: 'admin',
  OWNER: 'owner',
});

export const VOTE_STATUS = Object.freeze({
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const FIELDS_NAMES = Object.freeze({
  CATEGORY_ITEM: 'categoryItem',
  GALLERY_ALBUM: 'galleryAlbum',
  TAG_CATEGORY: 'tagCategory',
  GALLERY_ITEM: 'galleryItem',
  PAGE_CONTENT: 'pageContent',
  DESCRIPTION: 'description',
  SORT_CUSTOM: 'sortCustom',
  NEWS_FILTER: 'newsFilter',
  BACKGROUND: 'background',
  AUTHORITY: 'authority',
  WORK_TIME: 'workTime',
  TAG_CLOUD: 'tagCloud',
  LIST_ITEM: 'listItem',
  CHART_ID: 'chartid',
  ADDRESS: 'address',
  WEBSITE: 'website',
  RATING: 'rating',
  PARENT: 'parent',
  AVATAR: 'avatar',
  BUTTON: 'button',
  STATUS: 'status',
  TITLE: 'title',
  PHONE: 'phone',
  EMAIL: 'email',
  PRICE: 'price',
  FORM: 'form',
  BODY: 'body',
  NAME: 'name',
  BLOG: 'blog',
  LINK: 'link',
  MAP: 'map',
  TAG: 'tag',
});

export const ARRAY_FIELDS = [
  FIELDS_NAMES.CATEGORY_ITEM,
  FIELDS_NAMES.LIST_ITEM,
  FIELDS_NAMES.TAG_CATEGORY,
  FIELDS_NAMES.GALLERY_ITEM,
  FIELDS_NAMES.GALLERY_ALBUM,
  FIELDS_NAMES.RATING,
  FIELDS_NAMES.BUTTON,
  FIELDS_NAMES.PHONE,
  FIELDS_NAMES.BLOG,
  FIELDS_NAMES.FORM,
  FIELDS_NAMES.NEWS_FILTER,
];

export const MIN_PERCENT_TO_SHOW_UPDATE = 70;

export const CATEGORY_SWITCHER = Object.freeze({
  galleryAlbum: FIELDS_NAMES.GALLERY_ITEM,
  galleryItem: FIELDS_NAMES.GALLERY_ITEM,
  tagCategory: FIELDS_NAMES.CATEGORY_ITEM,
});

export const OBJECT_TYPES = Object.freeze({
  HASHTAG: 'hashtag',
  LIST: 'list',
  PAGE: 'page',
  RESTAURANT: 'restaurant',
  DISH: 'dish',
  DRINK: 'drink',
  BUSINESS: 'business',
  PRODUCT: 'product',
  SERVICE: 'service',
  COMPANY: 'company',
  PERSON: 'person',
  PLACE: 'place',
  CRYPTO: 'crypto',
  HOTEL: 'hotel',
});

export const CAMPAIGN_FIELDS = [
  FIELDS_NAMES.NAME,
  FIELDS_NAMES.AVATAR,
  FIELDS_NAMES.RATING,
  FIELDS_NAMES.PARENT,
  FIELDS_NAMES.CATEGORY_ITEM,
  FIELDS_NAMES.TAG_CATEGORY,
  FIELDS_NAMES.PRICE,
  FIELDS_NAMES.MAP,
  FIELDS_NAMES.ADDRESS,
  FIELDS_NAMES.TITLE,
  FIELDS_NAMES.DESCRIPTION,
  FIELDS_NAMES.LIST_ITEM,
  FIELDS_NAMES.BLOG,
  FIELDS_NAMES.NEWS_FILTER,
  FIELDS_NAMES.SORT_CUSTOM,
];

export const CAMPAIGN_MAP_FIELDS = [
  FIELDS_NAMES.NAME,
  FIELDS_NAMES.AVATAR,
  FIELDS_NAMES.MAP,
];
