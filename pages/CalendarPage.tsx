
import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import moment from 'moment';
import { loginRequest } from '../config/authConfig';
import { getGroupEvents, createGroupEvent, updateGroupEvent, deleteGroupEvent, getUserGroups } from '../services/graphService';
import { ROLE_SECRETARY_GROUP_OBJECT_ID } from '../constants';
import { CalendarAppEvent } from '../types';
import CalendarComponent from '../components/CalendarComponent';
import EventFormModal from '../components/EventFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CalendarPage: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [events, setEvents] = useState<CalendarAppEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarAppEvent> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSecretary, setIsSecretary] = useState(false);

  const getAccessToken = useCallback(async () => {
    const account = accounts[0];
    if (!account) {
      throw new Error("No active account! Please sign in.");
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        return instance.acquireTokenPopup(loginRequest).then(res => res.accessToken);
      }
      throw e;
    }
  }, [instance, accounts]);

  const checkUserRole = useCallback(async (token: string) => {
    if (!ROLE_SECRETARY_GROUP_OBJECT_ID) {
      setIsSecretary(true); // If no group is defined, everyone has secretary role for demo purposes
      return;
    }
    try {
      const userGroups = await getUserGroups(token);
      if (userGroups.includes(ROLE_SECRETARY_GROUP_OBJECT_ID)) {
        setIsSecretary(true);
      }
    } catch (err) {
      console.error("Failed to check user role:", err);
      setError("Could not verify your permissions.");
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await checkUserRole(token);
      const start = moment().startOf('month').toISOString();
      const end = moment().endOf('month').toISOString();
      const groupEvents = await getGroupEvents(token, start, end);
      setEvents(groupEvents as CalendarAppEvent[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar events.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, checkUserRole]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (event: CalendarAppEvent) => {
    if (!isSecretary) return;
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (!isSecretary) return;
    setSelectedEvent({ 
      start: { dateTime: moment(slotInfo.start).format('YYYY-MM-DDTHH:mm') },
      end: { dateTime: moment(slotInfo.end).format('YYYY-MM-DDTHH:mm') },
      isNew: true
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarAppEvent>) => {
    setError(null);
    try {
      const token = await getAccessToken();
      if (eventData.id) {
        await updateGroupEvent(token, eventData.id, eventData);
      } else {
        await createGroupEvent(token, eventData);
      }
      handleModalClose();
      fetchEvents(); // Refresh events
    } catch (err: any) {
      setError(err.message || 'Failed to save the event.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setError(null);
    try {
      const token = await getAccessToken();
      await deleteGroupEvent(token, eventId);
      handleModalClose();
      fetchEvents(); // Refresh events
    } catch (err: any) {
      setError(err.message || 'Failed to delete the event.');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Group Calendar</h1>
        {isSecretary && (
            <button
            onClick={() => handleSelectSlot({ start: new Date(), end: moment().add(1, 'hour').toDate() })}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
            New Event
            </button>
        )}
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <CalendarComponent 
            events={events} 
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            isSecretary={isSecretary}
        />
      )}
      
      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
      />
    </div>
  );
};

export default CalendarPage;
