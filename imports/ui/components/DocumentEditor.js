/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { documentEditor, eventsUpdate } from '../../modules/document-editor.js';
import GDCalender from './GDCalendar';

export default class DocumentEditor extends React.Component {
  componentDidMount() {
    documentEditor({ component: this });
    setTimeout(() => { document.querySelector('[name="title"]').focus(); }, 0);
  }

  changeDocEvents(newDoc) {
    this.props.doc = newDoc;
    eventsUpdate(newDoc);
  }

  render() {
    const { doc } = this.props;
    return (<form
      ref={ form => (this.documentEditorForm = form) }
      onSubmit={ event => event.preventDefault() }
    >
      <FormGroup>
        <ControlLabel>Title</ControlLabel>
        <FormControl
          type="text"
          name="title"
          defaultValue={ doc && doc.title }
          placeholder="Oh, The Places You'll Go!"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Description</ControlLabel>
        <FormControl
          componentClass="textarea"
          name="body"
          defaultValue={ doc && doc.body }
          placeholder="Congratulations! Today is your day. You're off to Great Places! You're off and away!"
        />
      </FormGroup>
      <FormGroup>
        <Button type="submit" bsStyle="success">
        { doc && doc._id ? 'Save Changes' : 'Add Room Scheduler' }
        </Button>
      </FormGroup>
      { 
        // doc && doc._id &&
        // <FormGroup>
        //   <ControlLabel>Calendar</ControlLabel>
        //   <GDCalender editable={true} creatable={true} doc={doc} changeDoc={this.changeDocEvents.bind(this)}/>
        // </FormGroup>
      }
      
    </form>);
  }
}

DocumentEditor.propTypes = {
  doc: PropTypes.object,
};
