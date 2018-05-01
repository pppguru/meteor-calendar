import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Factory } from 'meteor/dburles:factory';

const Documents = new Mongo.Collection('Documents');
export default Documents;

Documents.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Documents.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Documents.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'The title of the document.',
  },
  body: {
    type: String,
    label: 'The body of the document.',
  },
  events: {
    type: Array,
    optional: true,
  },
  'events.$' : {
    type: Object,
  },
  'events.$.title': {
    type: String,
  },
  'events.$.allDay': {
    type: Boolean,
    optional: true,
  },
  'events.$.start': {
    type: Date,
  },
  'events.$.end': {
    type: Date,
  }
});

Documents.attachSchema(Documents.schema);

Factory.define('document', Documents, {
  title: () => 'Factory Title',
  body: () => 'Factory Body',
});
