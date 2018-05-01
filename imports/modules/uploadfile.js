/* eslint-disable no-undef */

import { Bert } from 'meteor/themeteorchef:bert';
import { upsertWorkday } from '../api/workdays/methods';
import { upsertDocument } from '../api/documents/methods';
import Documents from '../api/documents/documents';
import { Meteor } from 'meteor/meteor';
import moment from 'moment-timezone';
import './validation.js';
import _ from 'lodash';

let component;

const docSubscription = Meteor.subscribe('documents.list');

const upload = () => {
  const CSVFormat = document.querySelector('[name="radioCSVFormatGroup"]:checked').value;

  const arrayRoomIDMatches = {
    '3': 'Seminar Room',
    '4': 'Auditorium',
    '5': 'Dining Room',
    '7': 'Flexible Classroom'
  };

  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
  if (regex.test($("#csvControlFile").val().toLowerCase())) {
      if (typeof (FileReader) != "undefined") {
          var reader = new FileReader();
          reader.onload = function (e) {
              var rows = e.target.result.split("\n");
              for (var i = 0; i < rows.length; i++) {
                var cells = rows[i].split(",");
                if (CSVFormat == 0) { // Letter day
                    if (cells.length != 4) {
                        component.uploadFileForm.reset();
                        Bert.alert('CSV format is not working for letter days', 'danger');
                        return;
                    }

                    var date = cells[1];
                    var letter = cells[2];
                    var daytype = cells[3];

                    if (date && letter) {
                        daytype = daytype ? daytype : '';
                        const workday = {
                            dates : date.trim(),
                            alphabet: letter,
                            daytype: daytype
                        };
                        
                        upsertWorkday.call(workday);
                    }
                }
                else if (CSVFormat == 1) { // Events import
                    if (cells.length != 7) {
                        component.uploadFileForm.reset();
                        Bert.alert('CSV format is not working for Events', 'danger');
                        return;
                    }

                    var roomID = cells[1];
                    var eventDateStr = cells[3];
                    var eventStartTimeStr = cells[4];
                    var eventEndTimeStr = cells[5];
                    var eventTitle = cells[6];

                    if (roomID && eventDateStr && eventStartTimeStr && eventEndTimeStr && eventTitle) {
                        if (docSubscription.ready()) {
                            const myDoc = Documents.findOne({ title: arrayRoomIDMatches[roomID]});
                            if (myDoc) {
                                const eventObj = {};
                                eventObj['title'] = eventTitle;

                                const startTimeStr = eventDateStr + ' ' + eventStartTimeStr;
                                const startDate = moment.tz(startTimeStr, 'M/D/YY H:m:s', 'America/Toronto').toDate();
                                
                                const endTimeStr = eventDateStr + ' ' + eventEndTimeStr;
                                const endDate = moment.tz(endTimeStr, 'M/D/YY H:m:s', 'America/Toronto').toDate();
                                eventObj['start'] = startDate;
                                eventObj['end'] = endDate;

                                const eventsArray = myDoc.events ? myDoc.events : [];
                                eventsArray.push(eventObj);
                                uniqEventsArray = _.uniqWith( eventsArray, _.isEqual);
                                myDoc.events = uniqEventsArray;

                                upsertDocument.call(myDoc);
                            }
                        }
                        
                        
                    }

                }
                else {
                    component.uploadFileForm.reset();
                    Bert.alert('CSV format is invalid', 'danger');
                    return;
                }
              }

              const CSVTitle = CSVFormat == 0 ? 'Letter days' : 'Events';
              Bert.alert('Successfully imported the CSV for ' + CSVTitle, 'success');
              component.uploadFileForm.reset();
          }
          reader.readAsText($("#csvControlFile")[0].files[0]);
      } else {
          alert("This browser does not support HTML5.");
      }
  } else {
      alert("Please upload a valid CSV file.");
  }
};

const validate = () => {
  $(component.uploadFileForm).validate({
    rules: {
      csvControlFile: {
        required: true,
      },
    },
    messages: {
      csvControlFile: {
        required: 'Select the CSV file',
      },
    },
    submitHandler() { upload(); },
  });
};

export default function handleUpload(options) {
  component = options.component;
  validate();
}
