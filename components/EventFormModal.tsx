import React, { useState, useEffect, useCallback } from 'react';
import { CalendarAppEvent } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarAppEvent>) => void;
  onDelete: (eventId: string) => void;
  event: Partial<CalendarAppEvent> | null;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, onDelete, event }) => {
  const [formData, setFormData] = useState<Partial<CalendarAppEvent>>({});
  const [attendees, setAttendees] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start: { dateTime: event.start?.dateTime?.slice(0, 16) || '', timeZone: 'UTC' },
        end: { dateTime: event.end?.dateTime?.slice(0, 16) || '', timeZone: 'UTC' }
      });
      setAttendees(event.attendees?.map(a => a.emailAddress?.address).join(', ') || '');
    } else {
      setFormData({});
      setAttendees('');
    }
  }, [event]);

  // FIX: Use a type guard to safely access the 'checked' property for checkboxes.
  // This narrows the event target to HTMLInputElement and prevents a type error,
  // as the 'checked' property does not exist on HTMLTextAreaElement.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'start' || name === 'end') {
        const dateKey = name as 'start' | 'end';
        setFormData(prev => ({ ...prev, [dateKey]: { ...prev[dateKey], dateTime: value } }));
    } else if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Use `as const` to ensure TypeScript infers the attendee type as the literal 'required' instead of the general `string` type, aligning it with the `AttendeeType` expected by Microsoft Graph.
    const attendeeArray = attendees.split(',').map(email => email.trim()).filter(Boolean).map(email => ({
        emailAddress: { address: email },
        type: 'required' as const
    }));

    onSave({ ...formData, attendees: attendeeArray });
  };
  
  const handleDelete = useCallback(() => {
    if (event?.id && window.confirm('Are you sure you want to delete this event?')) {
        onDelete(event.id);
    }
  }, [event, onDelete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {event?.id ? 'Edit Event' : 'Create New Event'}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <input type="text" name="subject" id="subject" value={formData.subject || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                <input type="datetime-local" name="start" id="start" value={formData.start?.dateTime || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                <input type="datetime-local" name="end" id="end" value={formData.end?.dateTime || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
             <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" name="location" id="location" value={formData.location?.displayName || ''} onChange={(e) => setFormData(p => ({...p, location: {displayName: e.target.value}}))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            <div>
              <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attendees (comma-separated emails)</label>
              <input type="text" name="attendees" id="attendees" value={attendees} onChange={(e) => setAttendees(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
             <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea name="body" id="body" value={formData.body?.content || ''} onChange={(e) => setFormData(p => ({...p, body: {contentType: 'html', content: e.target.value}}))} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="isOnlineMeeting" name="isOnlineMeeting" type="checkbox" checked={formData.isOnlineMeeting || false} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="isOnlineMeeting" className="font-medium text-gray-700 dark:text-gray-300">Create Teams Meeting</label>
                </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
            <div>
              {event?.id && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Delete
                </button>
              )}
            </div>
            <div>
                <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Save
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;