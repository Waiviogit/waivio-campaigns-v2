import { Inject, Injectable } from '@nestjs/common';
import {
  APP_PROVIDE,
  FIELDS_NAMES,
  GPS_DIFF,
  SECONDS_IN_DAY,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import ExifReader from 'exifreader';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { WobjectHelperInterface } from '../../wobject/interface';
import { ProcessedWobjectType } from '../../wobject/types';
import { configService } from '../../../common/config';
import axios from 'axios';
import {
  DetectFraudType,
  FraudType,
  GetMapType,
  handleImagesType,
} from './types';
import { FraudDetectionInterface } from './interface';

@Injectable()
export class FraudDetection implements FraudDetectionInterface {
  constructor(
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
  ) {}

  async detectFraud({ campaign, images }: DetectFraudType): Promise<FraudType> {
    let fraud = false;
    const fraudCodes = [];
    if (!images.length || _.isEmpty(campaign)) return { fraud, fraudCodes };

    const deadline = Math.round(
      moment(campaign.reservedAt).subtract(14, 'days').valueOf() / 1000,
    );
    const map = await this.getMap(campaign.requiredObject);
    const {
      exifCounter,
      photoWidth,
      photoDates,
      models,
      latitudeArr,
      longitudeArr,
    } = await this.handleImages(images);

    if (this.checkResolution(photoWidth)) {
      fraudCodes.push(`${process.env.FR_RESOLUTION}${_.random(10, 99)}`);
      fraud = true;
    }
    if (!exifCounter) {
      fraudCodes.push(`${process.env.FR_META_ALL}${_.random(10, 99)}`);
      fraud = true;
    }
    if (exifCounter !== 0 && exifCounter === images.length - 1) {
      fraudCodes.push(`${process.env.FR_META_ONE}${_.random(10, 99)}`);
      fraud = true;
    }
    if (this.checkValues(photoDates, SECONDS_IN_DAY)) {
      fraudCodes.push(`${process.env.FR_DATE}${_.random(10, 99)}`);
      fraud = true;
    }
    if (
      this.checkValues(latitudeArr, GPS_DIFF) ||
      this.checkValues(longitudeArr, GPS_DIFF)
    ) {
      fraudCodes.push(`${process.env.FR_GPS_DIFF}${_.random(10, 99)}`);
      fraud = true;
    }
    if (
      this.checkValues([...latitudeArr, map.latitude], GPS_DIFF) ||
      this.checkValues([...longitudeArr, map.longitude], GPS_DIFF)
    ) {
      fraudCodes.push(`${process.env.FR_GPS_1}${_.random(10, 99)}`);
      fraud = true;
    }
    if (_.uniq(models).length > 1) {
      fraudCodes.push(`${process.env.FR_ID_DIFF}${_.random(10, 99)}`);
      fraud = true;
    }
    if (!_.isEmpty(photoDates)) {
      if (!_.isEmpty(_.filter(photoDates, (el) => el < deadline))) {
        fraudCodes.push(`${process.env.FR_DATE_RW}${_.random(10, 99)}`);
        fraud = true;
      }
    }
    return { fraud, fraudCodes };
  }

  private async getMap(author_permlink: string): Promise<GetMapType> {
    let map = {};
    const result = await this.wobjectRepository.findOne({
      filter: { author_permlink },
    });
    if (!result) return map;

    const app = await this.appRepository.findOne({
      filter: { host: configService.getAppHost() },
    });
    const fields = this.wobjectHelper.processWobjects({
      wobjects: result as ProcessedWobjectType,
      fields: [FIELDS_NAMES.MAP],
      app,
      returnArray: false,
    });
    if (_.get(fields, FIELDS_NAMES.MAP)) map = JSON.parse(fields.map);
    return map;
  }

  private async handleImages(images: string[]): Promise<handleImagesType> {
    const photoWidth = [],
      photoDates = [],
      latitudeArr = [],
      longitudeArr = [],
      models = [];
    let exifCounter = 0;
    for (const image of images) {
      try {
        const { data } = await axios.get(image, {
          responseType: 'arraybuffer',
        });
        const parsedFile = await ExifReader.load(data, { async: true });

        const model = _.get(parsedFile, 'Model.description');
        const ifNotHaveModel =
          _.get(parsedFile, 'Orientation.description') || '';
        const date = _.get(parsedFile, 'DateTimeOriginal.description');
        const latitude = _.get(parsedFile, 'GPSLatitude.description');
        const longitude = _.get(parsedFile, 'GPSLongitude.description');
        const width = _.get(
          parsedFile,
          'ImageWidth.description',
          _.get(parsedFile, 'ExifImageWidth.description'),
        );

        if (date || (latitude && longitude)) exifCounter++;
        if (model || ifNotHaveModel) models.push(model || ifNotHaveModel);
        if (date) photoDates.push(date);
        if (width) photoWidth.push(parseFloat(width) || 0);
        if (latitude && longitude) {
          latitudeArr.push(latitude);
          longitudeArr.push(longitude);
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    return {
      exifCounter,
      photoWidth,
      photoDates,
      models,
      latitudeArr,
      longitudeArr,
    };
  }

  private checkResolution(values: number[]): boolean {
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        const check1 = values[i] === (values[j] * 2) / 3;
        const check2 = values[i] === (values[j] * 3) / 2;
        const check3 = values[i] === (values[j] * 3) / 4;
        const check4 = values[i] === (values[j] * 4) / 3;
        const check5 = values[i] === (values[j] * 9) / 16;
        const check6 = values[i] === (values[j] * 16) / 9;
        const check7 = values[i] === values[j];
        const condition =
          check1 || check2 || check3 || check4 || check5 || check6 || check7;
        if (i !== j && !condition) {
          return true;
        }
      }
    }
    return false;
  }

  private checkValues(values: number[], controlValue: number): boolean {
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (i !== j && Math.abs(values[i] - values[j]) > controlValue) {
          return true;
        }
      }
    }
    return false;
  }
}
