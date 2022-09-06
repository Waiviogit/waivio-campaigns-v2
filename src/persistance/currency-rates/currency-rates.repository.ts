import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CurrencyRatesDocumentType, CurrencyRatesFindType } from './types';

import { CurrencyRates } from './currency-rates.schema';
import { CurrencyRatesRepositoryInterface } from './interface';

@Injectable()
export class CurrencyRatesRepository
  implements CurrencyRatesRepositoryInterface
{
  private readonly logger = new Logger(CurrencyRatesRepository.name);
  constructor(
    @InjectModel(CurrencyRates.name)
    private readonly model: Model<CurrencyRatesDocumentType>,
  ) {}

  async findOne({
    filter,
    projection,
    options,
  }: CurrencyRatesFindType): Promise<CurrencyRatesDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: CurrencyRatesFindType): Promise<CurrencyRatesDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
