import React from 'react';
import DocumentEditor from '../components/DocumentEditor.js';

const NewDocument = () => (
  <div className="NewDocument">
    <h4 className="page-header">New Room Scheduler</h4>
    <DocumentEditor doc={title='', body='', events=[]}/>
  </div>
);

export default NewDocument;
