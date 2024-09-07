import { ISettingsState } from '@state/settings-state/interfaces/settings-state';
import { IMainframeHardwareState } from '@state/mainframe-hardware-state/interfaces/mainframe-hardware-state';
import { IProgram } from '@state/progam-factory/interfaces/program';

export interface IProcessParameters {
  program: IProgram;
  isActive: boolean;
  threads: number;
  currentCompletionPoints: number;
  settingsState: ISettingsState;
  mainframeHardwareState: IMainframeHardwareState;
}
