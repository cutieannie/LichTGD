
import React from 'react';
import { Calendar, momentLocalizer, Views, EventProps } from 'react-big-calendar';
import moment from 'moment';
import { CalendarAppEvent } from '../types';

const localizer = momentLocalizer(moment);

interface CalendarComponentProps {
  events: CalendarAppEvent[];
  onSelectEvent: (event: CalendarAppEvent) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  isSecretary: boolean;
}

const EventDisplay: React.FC<EventProps<CalendarAppEvent>> = ({ event }) => {
  return (
    <div className="flex flex-col">
      <strong>{event.subject}</strong>
      <span className="text-sm italic">{event.location?.displayName}</span>
    </div>
  );
};

const CalendarComponent: React.FC<CalendarComponentProps> = ({ events, onSelectEvent, onSelectSlot, isSecretary }) => {
  // FIX: Instead of transforming the events array, use accessors to provide the necessary props to `react-big-calendar`.
  // This avoids type mismatches and ensures the original event object is used in handlers like `onSelectEvent`.
  // Events without a valid start/end dateTime are filtered out to prevent rendering errors.
  const displayableEvents = events.filter(e => e.start?.dateTime && e.end?.dateTime);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-[80vh]">
      <Calendar
        localizer={localizer}
        events={displayableEvents}
        startAccessor={(event) => new Date(event.start!.dateTime!)}
        endAccessor={(event) => new Date(event.end!.dateTime!)}
        titleAccessor="subject"
        style={{ height: '100%' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        selectable={isSecretary}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        components={{
          event: EventDisplay
        }}
        eventPropGetter={(event) => {
          const newEventStyles = event.isNew ? { className: 'border-l-4 border-green-500' } : {};
          return newEventStyles;
        }}
      />
    </div>
  );
};

export default CalendarComponent;
