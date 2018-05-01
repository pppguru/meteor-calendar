import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

Meteor.users.allow({ update: () => true });
const Users = Meteor.users;

export default Users;