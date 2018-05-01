import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Workdays from '../workdays';

Meteor.publish('workdays.list', () => Workdays.find());

Meteor.publish('workdays.view', (_id) => {
  check(_id, String);
  return Workdays.find(_id);
});

