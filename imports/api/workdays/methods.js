import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Workdays from './workdays';
import rateLimit from '../../modules/rate-limit.js';

export const upsertWorkday = new ValidatedMethod({
  name: 'workday.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    dates: { type: String },
    alphabet: { type: String },
    daytype: { type: String, optional: true },
  }).validator(),
  run({ dates, alphabet, daytype }) {
    Workdays.upsert({ dates: dates }, { $set: { dates: dates, alphabet : alphabet, daytype : daytype}});
  },
});
