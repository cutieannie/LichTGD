import { Event as GraphEvent } from '@microsoft/microsoft-graph-types';

// Extending the Graph Event type to include a local 'isNew' flag for UI state
export interface CalendarAppEvent extends GraphEvent {
  isNew?: boolean;
}
