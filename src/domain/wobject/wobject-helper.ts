import { Inject, Injectable } from '@nestjs/common';
import {
  AddDataToFieldsInType,
  ArrayFieldFilterType,
  FieldVoteType,
  FilterFieldValidationType,
  GetFieldsToDisplayInType,
  GetFilteredFieldsType,
  ProcessedFieldType,
  ProcessedWobjectType,
  ProcessWobjectsManyType,
  ProcessWobjectsSingleType,
  ProcessWobjectsType,
  SpecialFieldFilterType,
} from './types';
import {
  ADMIN_ROLES,
  APP_PROVIDE,
  ARRAY_FIELDS,
  CAMPAIGN_PROVIDE,
  CATEGORY_SWITCHER,
  FIELDS_NAMES,
  LANGUAGES,
  MIN_PERCENT_TO_SHOW_UPDATE,
  OBJECT_TYPES,
  VOTE_STATUS,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import * as _ from 'lodash';
import { WobjectFieldsDocumentType } from '../../persistance/wobject/types';
import { WobjectRepositoryInterface } from '../../persistance/wobject/interface';
import { AppRepositoryInterface } from '../../persistance/app/interface';
import { configService } from '../../common/config';
import { WobjectHelperInterface } from './interface';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { FilterQuery } from 'mongoose';
import { CampaignDocumentType } from '../../persistance/campaign/types';

@Injectable()
export class WobjectHelper implements WobjectHelperInterface {
  constructor(
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
  ) {}

  private getTopTags(obj: ProcessedWobjectType): string[] {
    const tagCategories = _.get(obj, 'tagCategory', []);
    if (_.isEmpty(tagCategories)) return [];
    let tags = [];
    for (const tagCategory of tagCategories) {
      tags = _.concat(tags, tagCategory.items);
    }
    return _.chain(tags)
      .orderBy('weight', 'desc')
      .slice(0, 2)
      .map('body')
      .value();
  }

  private getDefaultLink(obj: ProcessedWobjectType): string {
    let listItem = _.get(obj, 'listItem', []);
    if (listItem.length) {
      _.find(listItem, (list) => list.type === 'menuList')
        ? (listItem = _.filter(listItem, (list) => list.type === 'menuList'))
        : null;
      const item = _.chain(listItem)
        .orderBy(
          [(list): number => _.get(list, 'adminVote.timestamp', 0), 'weight'],
          ['desc', 'desc'],
        )
        .first()
        .value();
      return `/object/${obj.author_permlink}/${
        item.type === 'menuPage' ? 'page' : 'menu'
      }#${item.body}`;
    }
    if (_.get(obj, 'newsFilter', []).length)
      return `/object/${obj.author_permlink}/newsFilter/${obj.newsFilter[0].permlink}`;
    if (_.get(obj, 'blog', []).length)
      return `/object/${obj.author_permlink}/blog/@${obj.blog[0].body}`;

    return `/object/${obj.author_permlink}`;
  }

  private getCustomSortLink(obj: ProcessedWobjectType): string {
    if (obj.object_type === OBJECT_TYPES.LIST)
      return `/object/${obj.author_permlink}/list`;

    const field = _.find(_.get(obj, 'listItem', []), {
      body: obj.sortCustom[0],
    });
    const blog = _.find(
      _.get(obj, 'blog', []),
      (el) => el.permlink === obj.sortCustom[0],
    );
    const news = _.find(
      _.get(obj, 'newsFilter', []),
      (el) => el.permlink === obj.sortCustom[0],
    );
    if (field)
      return `/object/${obj.author_permlink}/${
        field.type === 'menuPage' ? 'page' : 'menu'
      }#${field.body}`;
    if (blog) return `/object/${obj.author_permlink}/blog/@${blog.body}`;
    if (news)
      return `/object/${obj.author_permlink}/newsFilter/${news.permlink}`;

    return `/object/${obj.author_permlink}`;
  }

  private getLinkToPageLoad(obj: ProcessedWobjectType): string {
    //TODO
    // if (getNamespace('request-session').get('device') === DEVICE.MOBILE) {
    //     return obj.object_type === OBJECT_TYPES.HASHTAG
    //         ? `/object/${obj.author_permlink}`
    //         : `/object/${obj.author_permlink}/about`;
    // }
    if (_.get(obj, 'sortCustom', []).length) return this.getCustomSortLink(obj);

    switch (obj.object_type) {
      case OBJECT_TYPES.PAGE:
        return `/object/${obj.author_permlink}/page`;
      case OBJECT_TYPES.LIST:
        return `/object/${obj.author_permlink}/list`;
      case OBJECT_TYPES.BUSINESS:
      case OBJECT_TYPES.PRODUCT:
      case OBJECT_TYPES.SERVICE:
      case OBJECT_TYPES.COMPANY:
      case OBJECT_TYPES.PERSON:
      case OBJECT_TYPES.PLACE:
      case OBJECT_TYPES.HOTEL:
      case OBJECT_TYPES.RESTAURANT:
        return this.getDefaultLink(obj);
      default:
        return `/object/${obj.author_permlink}`;
    }
  }

  private specialFieldFilter({
    field,
    allFields,
    id,
  }: SpecialFieldFilterType): ProcessedFieldType | null {
    if (!field.adminVote && field.weight < 0) return null;
    field.items = [];
    const filteredItems = _.filter(
      allFields[CATEGORY_SWITCHER[id]],
      (item) =>
        item.id === field.id && _.get(item, 'adminVote.status') !== 'rejected',
    );

    for (const itemField of filteredItems) {
      if (!field.adminVote && itemField.weight < 0) continue;
      field.items.push(itemField);
    }
    if (id === 'tagCategory' && field.items.length === 0) return null;
    return field;
  }

  private arrayFieldFilter({
    idFields,
    allFields,
    filter,
    id,
    permlink,
  }: ArrayFieldFilterType): ProcessedFieldType[] {
    const validFields = [];
    for (const field of idFields) {
      if (_.get(field, 'adminVote.status') === 'rejected') continue;
      switch (id) {
        case FIELDS_NAMES.TAG_CATEGORY:
        case FIELDS_NAMES.GALLERY_ALBUM:
          validFields.push(this.specialFieldFilter({ field, allFields, id }));
          break;
        case FIELDS_NAMES.RATING:
        case FIELDS_NAMES.PHONE:
        case FIELDS_NAMES.BUTTON:
        case FIELDS_NAMES.BLOG:
        case FIELDS_NAMES.FORM:
        case FIELDS_NAMES.GALLERY_ITEM:
        case FIELDS_NAMES.LIST_ITEM:
        case FIELDS_NAMES.NEWS_FILTER:
          if (_.includes(filter, FIELDS_NAMES.GALLERY_ALBUM)) break;
          if (_.get(field, 'adminVote.status') === VOTE_STATUS.APPROVED)
            validFields.push(field);
          else if (
            field.weight > 0 &&
            field.approvePercent > MIN_PERCENT_TO_SHOW_UPDATE
          ) {
            validFields.push(field);
          }
          break;
        default:
          break;
      }
    }
    if (id === FIELDS_NAMES.GALLERY_ALBUM) {
      const noAlbumItems = _.filter(
        allFields[CATEGORY_SWITCHER[id]],
        (item) =>
          item.id === permlink &&
          _.get(item, 'adminVote.status') !== VOTE_STATUS.REJECTED,
      );
      if (noAlbumItems.length)
        validFields.push({ items: noAlbumItems, body: 'Photos' });
    }
    return _.compact(validFields);
  }

  private filterFieldValidation({
    field,
    filter,
    locale,
    ownership,
  }: FilterFieldValidationType): boolean {
    field.locale === LANGUAGES.AUTO ? (field.locale = LANGUAGES.en_US) : null;
    const localeIndependentFields = ['status', 'map', 'parent'];
    let result =
      _.includes(localeIndependentFields, field.name) ||
      locale === field.locale;
    if (filter) result = result && _.includes(filter, field.name);
    if (ownership) {
      result =
        result &&
        _.includes(
          [ADMIN_ROLES.OWNERSHIP, ADMIN_ROLES.ADMIN, ADMIN_ROLES.OWNER],
          _.get(field, 'adminVote.role'),
        );
    }
    return result;
  }

  private getFilteredFields({
    fields,
    filter,
    locale,
    ownership,
  }: GetFilteredFieldsType): ProcessedFieldType[] {
    const fieldTypes = _.reduce(
      fields,
      (acc, el) => {
        if (_.has(acc, `${el.name}`)) {
          acc[el.name].push(el);
          return acc;
        }
        acc[el.name] = [el];
        return acc;
      },
      {},
    );

    return _.reduce(
      fieldTypes,
      (acc, el) => {
        const nativeLang = _.filter(el, (field) =>
          this.filterFieldValidation({ filter, field, locale, ownership }),
        );

        _.isEmpty(nativeLang) && locale !== 'en-US'
          ? (acc = [
              ...acc,
              ..._.filter(el, (field) =>
                this.filterFieldValidation({
                  filter,
                  field,
                  locale: LANGUAGES.en_US,
                  ownership,
                }),
              ),
            ])
          : (acc = [...acc, ...nativeLang]);
        return acc;
      },
      [],
    );
  }

  private getFieldsToDisplay({
    fields,
    filter,
    locale,
    permlink,
    ownership,
  }: GetFieldsToDisplayInType): object {
    locale = locale === LANGUAGES.AUTO ? LANGUAGES.en_US : locale;
    const winningFields = {};
    const filteredFields = this.getFilteredFields({
      fields,
      locale,
      filter,
      ownership,
    });
    if (!filteredFields.length) return {};

    const groupedFields = _.groupBy(filteredFields, 'name');
    for (const id of Object.keys(groupedFields)) {
      const approvedFields = _.filter(
        groupedFields[id],
        (field) => _.get(field, 'adminVote.status') === 'approved',
      );

      if (_.includes(ARRAY_FIELDS, id)) {
        const result = this.arrayFieldFilter({
          idFields: groupedFields[id],
          allFields: groupedFields,
          filter,
          id,
          permlink,
        });
        if (result.length) winningFields[id] = result;
        continue;
      }

      if (approvedFields.length) {
        const ownerVotes = _.filter(
          approvedFields,
          (field) => field.adminVote.role === ADMIN_ROLES.OWNER,
        );
        const adminVotes = _.filter(
          approvedFields,
          (field) => field.adminVote.role === ADMIN_ROLES.ADMIN,
        );
        if (ownerVotes.length)
          winningFields[id] = _.maxBy(ownerVotes, 'adminVote.timestamp').body;
        else if (adminVotes.length)
          winningFields[id] = _.maxBy(adminVotes, 'adminVote.timestamp').body;
        else
          winningFields[id] = _.maxBy(
            approvedFields,
            'adminVote.timestamp',
          ).body;
        continue;
      }
      const heaviestField = _.maxBy(groupedFields[id], (field) => {
        if (
          _.get(field, 'adminVote.status') !== 'rejected' &&
          field.weight > 0 &&
          field.approvePercent > MIN_PERCENT_TO_SHOW_UPDATE
        )
          return field.weight;
      });
      if (heaviestField) winningFields[id] = heaviestField.body;
    }
    return winningFields;
  }

  private calculateApprovePercent(field: ProcessedFieldType): number {
    if (_.isEmpty(field.active_votes)) return 100;
    if (field.adminVote)
      return field.adminVote.status === VOTE_STATUS.APPROVED ? 100 : 0;
    if (field.weight < 0) return 0;

    const rejectsWeight =
      _.sumBy(field.active_votes, (vote) => {
        if (vote.percent < 0) {
          return -(+vote.weight || -1);
        }
      }) || 0;
    const approvesWeight =
      _.sumBy(field.active_votes, (vote) => {
        if (vote.percent > 0) {
          return +vote.weight || 1;
        }
      }) || 0;
    if (!rejectsWeight) return 100;
    const percent = _.round(
      (approvesWeight / (approvesWeight + rejectsWeight)) * 100,
      3,
    );
    return percent > 0 ? percent : 0;
  }

  private getFieldVoteRole(vote: FieldVoteType): string | null {
    let role = ADMIN_ROLES.ADMIN;
    vote.ownership ? (role = ADMIN_ROLES.OWNERSHIP) : null;
    vote.administrative ? (role = ADMIN_ROLES.ADMINISTRATIVE) : null;
    vote.owner ? (role = ADMIN_ROLES.OWNER) : null;
    return role;
  }

  private addDataToFields({
    fields,
    filter,
    admins,
    ownership,
    administrative,
    owner,
  }: AddDataToFieldsInType): WobjectFieldsDocumentType[] {
    if (filter)
      fields = _.filter(fields, (field) => _.includes(filter, field.name));
    for (const field of fields) {
      let adminVote, administrativeVote, ownershipVote, ownerVote;
      _.map(field.active_votes, (vote) => {
        vote.timestamp = vote._id.getTimestamp().valueOf();
        if (vote.voter === owner) {
          vote.owner = true;
          ownerVote = vote;
        } else if (_.includes(admins, vote.voter)) {
          vote.admin = true;
          vote.timestamp > _.get(adminVote, 'timestamp', 0)
            ? (adminVote = vote)
            : null;
        } else if (_.includes(administrative, vote.voter)) {
          vote.administrative = true;
          vote.timestamp > _.get(administrativeVote, 'timestamp', 0)
            ? (administrativeVote = vote)
            : null;
        } else if (_.includes(ownership, vote.voter)) {
          vote.ownership = true;
          vote.timestamp > _.get(ownershipVote, 'timestamp', 0)
            ? (ownershipVote = vote)
            : null;
        }
      });
      field.createdAt = field._id.getTimestamp().valueOf();
      /** If field includes admin votes fill in it */
      if (ownerVote || adminVote || administrativeVote || ownershipVote) {
        const mainVote =
          ownerVote || adminVote || ownershipVote || administrativeVote;
        field.adminVote = {
          role: this.getFieldVoteRole(mainVote),
          status:
            mainVote.percent > 0 ? VOTE_STATUS.APPROVED : VOTE_STATUS.REJECTED,
          name: mainVote.voter,
          timestamp: mainVote.timestamp,
        };
      }
      field.approvePercent = this.calculateApprovePercent(field);
    }
    return fields;
  }

  processWobjects(params: ProcessWobjectsSingleType): ProcessedWobjectType;
  processWobjects(params: ProcessWobjectsManyType): ProcessedWobjectType[];

  processWobjects({
    wobjects,
    fields,
    app,
    locale = LANGUAGES.en_US,
  }: ProcessWobjectsType): ProcessedWobjectType | ProcessedWobjectType[] {
    const filteredWobjects = [];
    const admins = _.get(app, 'admins', []);

    if (!_.isArray(wobjects)) {
      wobjects = [wobjects] as ProcessedWobjectType[];
    }
    for (let obj of wobjects as ProcessedWobjectType[]) {
      /** Get app admins, wobj administrators, which was approved by app owner(creator) */
      const ownership = _.intersection(
        _.get(obj, 'authority.ownership', []),
        _.get(app, 'authority', []),
      );
      const administrative = _.intersection(
        _.get(obj, 'authority.administrative', []),
        _.get(app, 'authority', []),
      );

      obj.fields = this.addDataToFields({
        fields: obj.fields as ProcessedFieldType[],
        filter: fields,
        admins,
        ownership,
        administrative,
        owner: _.get(app, 'owner'),
      });
      /** Omit map, because wobject has field map, temp solution? maybe field map in wobj not need */
      obj = _.omit(obj, ['map']);
      Object.assign(
        obj,
        this.getFieldsToDisplay({
          fields: obj.fields as ProcessedFieldType[],
          filter: fields,
          locale,
          permlink: obj.author_permlink,
          ownership: !!ownership.length,
        }),
      );
      obj = _.omit(obj, [
        'fields',
        'latest_posts',
        'last_posts_counts_by_hours',
        'tagCategories',
      ]);
      if (obj.sortCustom && typeof obj.sortCustom === 'string') {
        obj.sortCustom = JSON.parse(obj.sortCustom);
      }

      obj.defaultShowLink = this.getLinkToPageLoad(obj);
      if (_.has(obj, FIELDS_NAMES.TAG_CATEGORY)) {
        obj.topTags = this.getTopTags(obj);
      }

      filteredWobjects.push(obj);
    }

    const length = _.get(wobjects, 'length');

    return length > 1 ? filteredWobjects : filteredWobjects[0];
  }

  async getWobjectName(permlink: string): Promise<string> {
    const wobject = await this.wobjectRepository.findOneByPermlink(permlink);
    const app = await this.appRepository.findOneByHost(
      configService.getAppHost(),
    );
    // const app = await getSessionApp();
    const processed = this.processWobjects({
      wobjects: wobject as ProcessedWobjectType,
      fields: [FIELDS_NAMES.NAME],
      app,
    });
    return processed.name || wobject.default_name;
  }

  async updateCampaignsCountForManyCampaigns(
    filter: FilterQuery<CampaignDocumentType>,
    status: string,
  ): Promise<void> {
    const campaigns = await this.campaignRepository.find({
      filter,
      projection: { objects: 1, requiredObject: 1 },
    });
    if (_.isEmpty(campaigns)) return;
    for (const campaign of campaigns) {
      await this.wobjectRepository.updateCampaignsCount(
        campaign._id.toString(),
        status,
        [campaign.requiredObject, ...campaign.objects],
      );
    }
  }
}
