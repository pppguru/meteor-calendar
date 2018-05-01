import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import Workdays from '../../api/workdays/workdays';
import TimePicker from 'react-bootstrap-time-picker';
import { OverlayTrigger, Popover, Button, Modal, FormControl } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

BigCalendar.momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

function overlap(dateRanges){
    var sortedRanges = dateRanges.sort((previous, current) => {
    
      // get the start date from previous and current
      var previousTime = previous.start.getTime();
      var currentTime = current.start.getTime();
  
      // if the previous is earlier than the current
      if (previousTime < currentTime) {
        return -1;
      }
  
      // if the previous time is the same as the current time
      if (previousTime === currentTime) {
        return 0;
      }
  
      // if the previous time is later than the current time
      return 1;
    });
    
    var result = sortedRanges.reduce((result, current, idx, arr) => {
      // get the previous range
      if (idx === 0) { return result; }
      var previous = arr[idx-1];
    
      // check for any overlap
      var previousEnd = previous.end.getTime();
      var currentStart = current.start.getTime();
      var overlap = (previousEnd > currentStart);
    
      // store the result
      if (overlap) {
        // yes, there is overlap
        result.overlap = true;
        // store the specific ranges that overlap
        result.ranges.push({
          previous: previous,
          current: current
        })
      }
     
      return result;
     
       // seed the reduce  
    }, {overlap: false, ranges: []});
  
  
    // return the final results  
    return result;
  }


const styles = {
    calendarView: {
        minHeight: '580px',
        flex: 1
    }
}

let tmpEvents = [];
let minDate = new Date(2017, 9, 24, 7, 0, 0);
let maxDate = new Date(2017, 9, 24, 22, 0, 0);
const subscription = Meteor.subscribe('workdays.list');

class WeekHeader extends React.Component {
    render() {
        let eventDate = this.props.date;

        const dateString = moment(eventDate).format('MMM D, YYYY');
        const day = moment(eventDate).format('dddd');

        let letterDay = ' ';
        const letterDateString = moment(eventDate).format('YYYY-MM-DD');

        if (subscription.ready()) {
          const workdays = Workdays.find({dates : letterDateString}).fetch();
          if (workdays.length > 0) {
              letterDay = workdays[0].alphabet;
          }         
        }

        return  <span>
                    <em style={{ marginTop: 10 }}>{day}</em>
                    <br/>
                    <p>{ dateString }</p>
                    <em style={{ color: 'magenta'}}>{letterDay}</em>
                </span>
    }
}

const popoverHoverFocus = (title, startDate, endDate) => (
    <Popover id="popover-trigger-hover-focus">
      Event : <strong>{title}</strong>
      <br />
      { moment(startDate).format('ddd MMM DD YYYY') }
      <br />
      Start : { moment(startDate).format('h:mm:ss A') }
      <br />
      End : { moment(endDate).format('h:mm:ss A') }
    </Popover>
  );

class MyEvent extends React.Component {
    render() {

        const { event } = this.props;
        return <OverlayTrigger trigger={['hover', 'focus']} placement="top" overlay={popoverHoverFocus(event.title, event.start, event.end)}>
                    <span style={ {display: 'block', width: '100%', height: '100%', paddingTop: '10px'} }>
                        <em style={{ color: 'white', fontWeight: 'normal', fontSize: '13pt'}}>{event.title}</em>
                    </span>
               </OverlayTrigger>;
    }

}


class GDCalendar extends React.Component {
    constructor (props) {
        super(props);

        tmpEvents = this.props.doc && this.props.doc.events ? this.props.doc.events : [];
        this.state = {
            events: tmpEvents,
            showEventModal: false,
            selectedEvent: null,
            selectedEventStartTime: 0,
            selectedEventEndTime: 0,
        }

        this.moveEvent = this.moveEvent.bind(this);
    }

    moveEvent({event, start, end}) {
        //Check if this is editable
        if(!this.props.editable) return;

        const updateResult = this.replaceEventWithInfo({event, start, end});
        if (updateResult) {
            Bert.alert('Successfully changed the event!', 'success');
        }
    }

    onSelectTimes(slotInfo) {
        if(!this.props.creatable) return;

        let eventName = window.prompt('Please enter the event name', 'Event');
        if (eventName != null && eventName != "") {
            const eventInfo = {
                'title': eventName,
                'start': slotInfo.start,
                'end': slotInfo.end,
            }

            tmpEvents = this.state.events;

            //Check overlap
            const overlapOutput = overlap([...tmpEvents, eventInfo]);
            if (overlapOutput.overlap == true) {
                var result = _.some(overlapOutput.ranges, function (range) {
                                return (range.previous === eventInfo) || (range.current === eventInfo);
                            });

                if (result) {
                    Bert.alert('Event time cannot be overlapped.', 'warning');
                    console.log('Overlapped Info', JSON.stringify(overlapOutput));
                    return;    
                }
            }

            //If not overlap, add the event
            tmpEvents.push(eventInfo);
            this.setState({
                events: tmpEvents
            }, this.updateDocumentEvents);
        }
    }

    onSelectSlot(event) {

        if(!this.props.editable) return;

        this.setState({
            selectedEvent: event,
            selectedEventStartTime: moment(event.start).hours() * 3600 + moment(event.start).minutes() * 60,
            selectedEventEndTime: moment(event.end).hours() * 3600 + moment(event.end).minutes() * 60,
        });
        this.openEventEditor();
    }

    updateDocumentEvents() {
        let newDoc = this.props.doc;
        if (!newDoc) newDoc = [];
        newDoc.events = this.state.events;

        this.props.changeDoc(newDoc);
    }

    replaceEventWithInfo({ event, start, end, eventTitle }) {
        const { events } = this.state;
        
        const idx = events.indexOf(event);
        if (eventTitle && eventTitle.length) event.title = eventTitle;

        const updatedEvents = { ...event, start, end };

        const nextEvents = [...events];
        nextEvents.splice(idx, 1, updatedEvents);

        //Check overlap
        const overlapOutput = overlap(nextEvents);
        if (overlapOutput.overlap == true) {
            var result = _.some(overlapOutput.ranges, function (range) {
                return (range.previous === updatedEvents) || (range.current === updatedEvents);
            });

            if (result) {
                Bert.alert('Event time cannot be overlapped.', 'warning');
                console.log('Overlapped Info', JSON.stringify(overlapOutput));
                return false;
            }
        }

        this.setState({
            events: nextEvents
        }, this.updateDocumentEvents);

        return true;
    }

    handleStartTimeChange(time) {
        this.setState({
            selectedEventStartTime: time
        });
    }

    handleEndTimeChange(time) {
        this.setState({
            selectedEventEndTime: time
        });
        
    }

    saveCurrentEvent() {
        if (!this.state.selectedEvent) {
            Bert.alert('Event not found', 'danger');
            this.closeEventEditor();
            return;
        }

        const eventTitle = this.eventNewTitleText.value;
        if (eventTitle.length <= 0) {
            Bert.alert('The event title should be there', 'warning');
            this.closeEventEditor();
            return;
        }

        const event = this.state.selectedEvent;
        const startTimeValue = this.state.selectedEventStartTime;
        const endTimeValue = this.state.selectedEventEndTime;

        if (startTimeValue >= endTimeValue) {
            Bert.alert('The Start time should be ealier than the End time', 'warning');
            return;
        }

        const startHours = Math.floor(startTimeValue / 3600);
        const startMins = Math.floor((startTimeValue % 3600) / 60);
        const start = moment(event.start).set('hour', startHours).set('minute', startMins).toDate();

        const endHours = Math.floor(endTimeValue / 3600);
        const endMins = Math.floor((endTimeValue % 3600) / 60);
        const end = moment(event.end).set('hour', endHours).set('minute', endMins).toDate();

        // event.title = eventTitle;
        const updateResult = this.replaceEventWithInfo({ event, start, end, eventTitle });

        if (updateResult) {
            Bert.alert('Successfully changed the event!', 'success');
            this.closeEventEditor();
        }
    }

    deleteCurrentSelectedEvent() {
        if (!this.state.selectedEvent) {
            Bert.alert('Delete Event Error', 'danger');
            this.closeEventEditor();
            return;
        }

        const event = this.state.selectedEvent;
        const deleteConfirm = confirm('Do you want to delete the event \"' + event.title + '\"?');

        if (deleteConfirm == true) {
            tmpEvents = this.state.events;

            let newEvents = tmpEvents.filter(el => {
                return el != event;
            });

            tmpEvents = newEvents;
            this.setState({
                events: tmpEvents
            }, this.updateDocumentEvents);

            Bert.alert('Successfully deleted the event!', 'success');
            this.closeEventEditor();
        }
    }

    openEventEditor() {
        this.setState({ showEventModal: true });
    }


    closeEventEditor() {
        this.setState({ showEventModal: false });
    }

    render() {
        return (
            <div>
                <DragAndDropCalendar
                    selectable={this.props.creatable}
                    events={this.state.events}
                    defaultView='work_week'
                    views={['month', 'work_week']}
                    step={5}
                    min={minDate}
                    max={maxDate}
                    allDayAccessor={'All Day'}
                    // formats={{dayFormat: 'dddd, MMM D, YYYY'}}
                    // scrollToTime={new Date(1970, 1, 1, 6)}
                    onEventDrop={this.moveEvent}
                    onSelectEvent={this.onSelectSlot.bind(this)}
                    onSelectSlot={this.onSelectTimes.bind(this)}
                    style={styles.calendarView}
                    components={{
                        event: MyEvent,
                        work_week: {
                        header: WeekHeader
                        }
                    }}
                />

                <Modal show={this.state.showEventModal} onHide={this.closeEventEditor.bind(this)}>
                    <Modal.Header closeButton>
                    <Modal.Title>Event - {this.state.selectedEvent ? this.state.selectedEvent.title : ''}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <h5>Date: { !this.state.selectedEvent ? moment().format('MMM D, YYYY') : moment(this.state.selectedEvent.start).format('MMM D, YYYY')}</h5>
                    <h5>Current Start Time : { !this.state.selectedEvent ? moment().format('hh:mm A') : moment(this.state.selectedEvent.start).format('hh:mm A') }</h5>
                    <h5>Current End Time : { !this.state.selectedEvent ? moment().format('hh:mm A') : moment(this.state.selectedEvent.end).format('hh:mm A') }</h5>
                    <br/>
                    <p>Start Time: </p>
                    <TimePicker 
                        initialValue={ !this.state.selectedEvent ? moment().format("hh:mm") : moment(this.state.selectedEvent.start).format("hh:mm") }
                        start="7:00" 
                        end="22:00" 
                        step={5} 
                        onChange={ this.handleStartTimeChange.bind(this) }
                        value={ this.state.selectedEventStartTime }
                    />
                    <br/>
                    <p>End Time: </p>
                    <TimePicker 
                        initialValue={ !this.state.selectedEvent ? moment().format("hh:mm") : moment(this.state.selectedEvent.end).format("hh:mm") } 
                        start="7:00" 
                        end="22:00" 
                        step={5} 
                        onChange={ this.handleEndTimeChange.bind(this) } 
                        value={ this.state.selectedEventEndTime }
                    />
                    <br/>
                    <p>Title: </p>
                    <FormControl
                        type="text"
                        defaultValue={this.state.selectedEvent ? this.state.selectedEvent.title : ''}
                        placeholder="Enter title"
                        inputRef={ref => { this.eventNewTitleText = ref; }}
                    />
                    
                    <hr />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button bsStyle="success" onClick={this.saveCurrentEvent.bind(this)}>Save</Button>
                    <Button bsStyle="danger" onClick={this.deleteCurrentSelectedEvent.bind(this)}>Delete</Button>
                    <Button onClick={this.closeEventEditor.bind(this)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

// export default GDCalendar;
export default DragDropContext(HTML5Backend)(GDCalendar);