import React from 'react';
import { Link } from 'react-router';
import { Row, Col, Button } from 'react-bootstrap';
import UsersList from '../components/UsersList';
import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';

const Users = () => (
  <div className="Documents">
    <Row>
      <Col xs={ 12 }>
        <h2 className="pull-left">Users</h2>
      </Col>
      <Col xs={ 12 }>
        <div className="page-header clearfix">
          <h4 className="pull-left">List of Users</h4>
        </div>
        <UsersList />
      </Col>
    </Row>
  </div>
);

export default Users;
