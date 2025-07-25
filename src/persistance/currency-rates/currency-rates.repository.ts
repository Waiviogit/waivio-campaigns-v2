import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrencyRatesDocumentType } from './types';
import { CurrencyRates } from './currency-rates.schema';
import { CurrencyRatesRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class CurrencyRatesRepository
  extends MongoRepository<CurrencyRatesDocumentType>
  implements CurrencyRatesRepositoryInterface
{
  constructor(
    @InjectModel(CurrencyRates.name)
    protected readonly model: Model<CurrencyRatesDocumentType>,
  ) {
    super(model, new Logger(CurrencyRatesRepository.name));
  }
}
