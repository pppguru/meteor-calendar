import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Meteor } from 'meteor/meteor';
import Users from '../../api/users/users';
import container from '../../modules/container';
import { updateUserWithFieldKeyValue, updateUserWithRole } from '../../api/users/methods.js';
import _ from 'lodash';

const indexN = (cell, row, enumObject, index) => (
  <div>{index + 1}</div>
);

const renderCustom = (cell, row, extra) => {  
  const value = _.get(row, extra.path);

  if (extra.path == 'roles.__global_roles__[0]') {
    return cell? cell : value;
  }
  else {
    return value;
  }
};

function onAfterSaveCell(row, cellName, cellValue) {
  if (cellName == 'active'){
    updateUserWithFieldKeyValue.call(updateUserWithFieldKeyValue, row._id, cellName, cellValue);  
  }
  else if (cellName == 'roles.__global_roles__[0]'){
    updateUserWithRole.call(updateUserWithRole, row._id, cellValue);  
  }
    
}

function onBeforeSaveCell(row, cellName, cellValue) {
  // return false for reject the editing
  return true;
}

const cellEditProp = {
  mode: 'click',
  blurToSave: true,
  beforeSaveCell: onBeforeSaveCell, // a hook for before saving cell
  afterSaveCell: onAfterSaveCell  // a hook for after saving cell
};

const UsersList = ({ users }) => (

  <BootstrapTable 
    data={users} 
    striped={true} 
    hover={true} 
    condensed={true} 
    search={true} 
    cellEdit={cellEditProp}
    bordered={true} >
    <TableHeaderColumn width="100" editable={false} dataField="any" isKey={true} dataAlign="center" dataFormat={indexN}> No.</TableHeaderColumn>
    <TableHeaderColumn width="150" editable={false} dataField="profile.name.first" dataAlign="center" dataFormat={renderCustom} formatExtraData={{ path: 'profile.name.first' }}> First Name</TableHeaderColumn>
    <TableHeaderColumn width="150" editable={false} dataField="profile.name.last" dataAlign="center" dataFormat={renderCustom} formatExtraData={{ path: 'profile.name.last' }}> Last Name</TableHeaderColumn>
    <TableHeaderColumn editable={false} dataField="emails[0].address" dataAlign="center" dataFormat={renderCustom} formatExtraData={{ path: 'emails[0].address' }}> Email</TableHeaderColumn>
    <TableHeaderColumn width="100" dataField='roles.__global_roles__[0]' 
                       dataAlign="center" 
                       dataFormat={renderCustom}
                       formatExtraData={{ path: 'roles.__global_roles__[0]' }}
                       editable={ { type: 'select', options: { values: ['normal', 'admin'] } } }>
      Role
    </TableHeaderColumn>
    <TableHeaderColumn width="100" dataField='active' 
                       dataAlign="center"
                       editable={ { type: 'select', options: { values: ['Yes', 'No'] } } }>Active</TableHeaderColumn>
    
    
  </BootstrapTable>
);

UsersList.propTypes = {
  users: PropTypes.array,
};

export default container((props, onData) => {
  const subscription = Meteor.subscribe('users.list');
  if (subscription.ready()) {
    const users = Users.find().fetch();
    var filteredUsers = _.filter(users, function(user) {
      const role = user.roles.__global_roles__[0];
      return role && role != 'superadmin';
    });
    onData(null, { users: filteredUsers });
  }
}, UsersList);
