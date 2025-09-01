
import { Client } from '@microsoft/microsoft-graph-client';
import { Event } from '@microsoft/microsoft-graph-types';
import { GROUP_ID, TIMEZONE } from '../constants';

// NOTE: In a production application, these calls should be made from a secure backend (BFF pattern).
// The frontend would call your API routes, which would then use MSAL Node to securely acquire a token
// and call Microsoft Graph. This client-side approach is for demonstration purposes.

let graphClient: Client | undefined;

function ensureClient(accessToken: string): Client {
  if (!graphClient) {
    graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }
  return graphClient;
}

export async function getGroupEvents(accessToken: string, start: string, end: string): Promise<Event[]> {
  const client = ensureClient(accessToken);
  const response = await client
    .api(`/groups/${GROUP_ID}/calendar/events`)
    .header('Prefer', `outlook.timezone="${TIMEZONE}"`)
    .filter(`start/dateTime ge '${start}' and end/dateTime le '${end}'`)
    .select('id,subject,body,start,end,location,attendees,isOnlineMeeting,sensitivity,webLink')
    .orderby('start/dateTime')
    .get();

  return response.value;
}

export async function createGroupEvent(accessToken: string, event: Partial<Event>): Promise<Event> {
  const client = ensureClient(accessToken);
  
  const newEvent: Event = {
      ...event,
      start: { ...event.start, timeZone: TIMEZONE },
      end: { ...event.end, timeZone: TIMEZONE },
  };

  return await client.api(`/groups/${GROUP_ID}/events`).post(newEvent);
}

export async function updateGroupEvent(accessToken: string, eventId: string, event: Partial<Event>): Promise<void> {
  const client = ensureClient(accessToken);

  const updatedEvent: Partial<Event> = {
      ...event,
      start: event.start ? { ...event.start, timeZone: TIMEZONE } : undefined,
      end: event.end ? { ...event.end, timeZone: TIMEZONE } : undefined,
  };

  await client.api(`/groups/${GROUP_ID}/events/${eventId}`).patch(updatedEvent);
}

export async function deleteGroupEvent(accessToken: string, eventId: string): Promise<void> {
  const client = ensureClient(accessToken);
  await client.api(`/groups/${GROUP_ID}/events/${eventId}`).delete();
}

export async function getUserGroups(accessToken: string): Promise<string[]> {
    const client = ensureClient(accessToken);
    const response = await client.api('/me/memberOf?$select=id').get();
    return response.value.map((group: { id: string }) => group.id);
}
