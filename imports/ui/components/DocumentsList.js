import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Meteor } from 'meteor/meteor';
import Documents from '../../api/documents/documents';
import container from '../../modules/container';

const handleNav = _id => browserHistory.push(`/documents/${_id}`);

const indexN = (cell, row, enumObject, index) => (
  <div>{index + 1}</div>
);

const onRowSelect = (row, isSelected, e) => {
  handleNav(row._id);
};

const selectRowProp = {
  mode: 'radio',
  clickToSelect: true,
  onSelect: onRowSelect,
  hideSelectColumn: true,
}

const DocumentsList = ({ documents }) => (
  // documents.length > 0 ? <ListGroup className="DocumentsList">
  //   {documents.map(({ _id, title }) => (
  //     <ListGroupItem key={ _id } onClick={ () => handleNav(_id) }>
  //       { title }
  //     </ListGroupItem>
  //   ))}
  // </ListGroup> :
  // <Alert bsStyle="warning">No documents yet.</Alert>

  <BootstrapTable 
    data={documents} 
    striped={true} 
    hover={true} 
    condensed={true} 
    search={true} 
    selectRow={selectRowProp}
    bordered={true} >
    <TableHeaderColumn width="100" dataField="any" isKey={true} dataAlign="center" dataFormat={indexN}> No.</TableHeaderColumn>
    <TableHeaderColumn dataField="title">Title</TableHeaderColumn>
  </BootstrapTable>
);

DocumentsList.propTypes = {
  documents: PropTypes.array,
};

export default container((props, onData) => {
  const subscription = Meteor.subscribe('documents.list');
  if (subscription.ready()) {
    const documents = Documents.find().fetch();
    onData(null, { documents });
  }
}, DocumentsList);
