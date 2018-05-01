import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Workdays = new Mongo.Collection('Workdays');
export default Workdays;

Workdays.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Workdays.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Workdays.schema = new SimpleSchema({
  dates: {
    type: String,
  },
  alphabet: {
    type: String,
  },
  daytype: {
    type: String,
  },
});

Workdays.attachSchema(Workdays.schema);