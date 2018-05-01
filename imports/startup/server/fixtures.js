import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'lodash';

//------------------------------------
// if (!Meteor.isProduction) {
  const users = [{
    email: 'admin@admin.com',
    password: 'password',
    profile: {
      name: { first: 'Dana', last: 'Feldman' },
    },
    roles: ['superadmin'],
  }];

  users.forEach(({ email, password, profile, roles }) => {
    const userExists = Meteor.users.findOne({ 'emails.address': email });

    if (!userExists) {
      const userId = Accounts.createUser({ email, password, profile });
      Roles.addUsersToRoles(userId, roles[0], Roles.GLOBAL_GROUP);
    }
  });

  //Add Dana Feldman as a super admin and make them active
  const usersExists = Meteor.users.find({ profile: {
                                            name: { first: 'Dana', last: 'Feldman' },
                                          }
                                        }).fetch();
  if (usersExists) {
    usersExists.forEach((user) => {
      Meteor.users.update({_id : user._id}, { $set: { active: 'Yes' } });
      Roles.setUserRoles(user._id, 'superadmin', Roles.GLOBAL_GROUP);
    });
    
  }

  //Set the admin roles to specific users
  guofengUserId = 'tL93fYWkFfFrukgZR';
  Roles.setUserRoles(guofengUserId, 'superadmin', Roles.GLOBAL_GROUP);

  stanUserId = '3SvTB9mBoPeQRRm4v';
  Roles.addUsersToRoles(stanUserId, 'admin', Roles.GLOBAL_GROUP);

  danaUserId = 'p7cGmgdMq2z47ypTB';
  Roles.addUsersToRoles(danaUserId, 'admin', Roles.GLOBAL_GROUP);

  donaldUserId = 'SEHxeJc3GzPmYooff';
  Roles.addUsersToRoles(donaldUserId, 'admin', Roles.GLOBAL_GROUP);
// }

//Setting for google login-----------------------------
const settings = Meteor.settings.google;

if (settings) {  
  ServiceConfiguration.configurations.remove({
    service: 'google'
  });

  ServiceConfiguration.configurations.insert({
    service: 'google',
    clientId: settings.clientId,
    secret: settings.secret
  });
}
