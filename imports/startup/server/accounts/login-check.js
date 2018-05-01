import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.validateLoginAttempt((attemptInfo) => {
    if (!attemptInfo.allowed)
        return false;

    if (attemptInfo.error){
        var reason = attemptInfo.error.reason;
        if (reason === "User not found" || reason === "Incorrect password"){
            throw new Meteor.Error(403, reason, reason);
            return false;
        }
    }
    
    if (!attemptInfo.user.active || attemptInfo.user.active == 'No') {
        throw new Meteor.Error(403, 'User is not activated. Please wait until the admin approves your account.', 'User is not activated.');
        return false;
    }

    return true;
});
  