import { Document } from 'mongoose';
import {
  AppBot,
  AppCity,
  AppColors,
  AppCommissions,
  AppConfiguration,
  AppMapPoints,
  AppTagsData,
  AppTopUsers,
  ReferralTimers,
} from '../app.schema';

export type AppBeneficiaryType = {
  account: string;
  percent: number;
};

export type ChosenPostType = {
  account: string;
  permlink: string;
  title: string;
};

export type AppMapPointsType = AppMapPoints & Document;

export type AppCityType = AppCity & Document;

export type AppColorsType = AppColors & Document;

export type AppConfigurationType = AppConfiguration & Document;

export type AppTopUsersType = AppTopUsers & Document;

export type AppBotType = AppBot & Document;

export type AppCommissionsType = AppCommissions & Document;

export type ReferralTimersType = ReferralTimers & Document;

export type AppTagsDataType = AppTagsData & Document;
