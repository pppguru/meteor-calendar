import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Documents from '../../api/documents/documents';
import { removeDocument } from '../../api/documents/methods';
import NotFound from './NotFound';
import container from '../../modules/container';
import GDCalender from '../components/GDCalendar';
import { Roles } from 'meteor/alanning:roles';
import { eventsUpdate } from '../../modules/document-editor.js';

const handleEdit = (_id) => {
  browserHistory.push(`/documents/${_id}/edit`);
};

const handleRemove = (_id) => {
  if (confirm('Are you sure? This is permanent!')) {
    removeDocument.call({ _id }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Schedule deleted!', 'success');
        browserHistory.push('/documents');
      }
    });
  }
};

class ViewDocument extends React.Component {
  changeDocEvents(newDoc) {
    this.props.doc = newDoc;
    eventsUpdate(newDoc);
  }

  render() {
    const { doc } = this.props;
    return doc ? (
      <div className="ViewDocument">
        <div className="page-header clearfix">
          <h4 className="pull-left">{ doc && doc.title }</h4>
          {
            Roles.userIsInRole(Meteor.userId(), ['admin', 'superadmin'], Roles.GLOBAL_GROUP) &&
            <ButtonToolbar className="pull-right">
              <ButtonGroup bsSize="small">
                <Button onClick={ () => handleEdit(doc._id) }>Edit</Button>
                <Button onClick={ () => handleRemove(doc._id) } className="text-danger">Delete</Button>
              </ButtonGroup>
            </ButtonToolbar>
          }
        </div>
        { doc && doc.body }
        <br/> <br/>
        <GDCalender 
          editable={
            Roles.userIsInRole(Meteor.userId(), ['admin', 'superadmin'], Roles.GLOBAL_GROUP)
          } 
          creatable={true} 
          doc={doc} 
          changeDoc={this.changeDocEvents.bind(this)}
        />
      </div>
    ) : <NotFound />;
  }
};

ViewDocument.propTypes = {
  doc: PropTypes.object,
};

export default container((props, onData) => {
  const documentId = props.params._id;
  const subscription = Meteor.subscribe('documents.view', documentId);

  if (subscription.ready()) {
    const doc = Documents.findOne(documentId);
    onData(null, { doc });
  }
}, ViewDocument);
