import { Person } from '@state/common';
import React from 'react';

export interface CrewEditorCallbacks {
  startCreatingMember: () => void;
  startEditingMember: (person: Person) => void;
  listMembers: () => void;
}

export const crewEditorCallbacksContext = React.createContext<CrewEditorCallbacks>({
  startCreatingMember: () => {},
  startEditingMember: () => {},
  listMembers: () => {},
});
