import Users from './users';
import { Roles } from 'meteor/alanning:roles';
import rateLimit from '../../modules/rate-limit.js';

export const updateUserWithFieldKeyValue = (userId, key, value) => {
    let updateObj = {}; updateObj[key] = value;

    result = Users.update(userId, 
        { $set: updateObj }
    );
}

export const updateUserWithRole = (userId, role) => {
    Roles.setUserRoles(userId, role, Roles.GLOBAL_GROUP);
}

rateLimit({
  methods: [
    updateUserWithFieldKeyValue,
    updateUserWithRole,
  ],
  limit: 5,
  timeRange: 1000,
});
