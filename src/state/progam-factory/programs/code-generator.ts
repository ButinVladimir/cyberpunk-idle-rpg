import { MS_IN_SECOND } from '@shared/constants';
import { IMainframeHardwareState } from '@state/mainframe-hardware-state/interfaces/mainframe-hardware-state';
import { IMainframeDevelopingProgramsState } from '@state/mainframe-developing-programs-state/interfaces/mainframe-developing-programs-state';
import { ISettingsState } from '@state/settings-state/interfaces/settings-state';
import { MAINFRAME_HARDWARE_STATE_EVENTS } from '@state/mainframe-hardware-state/constants';
import constants from '@configs/constants.json';
import { ProgramName } from '../types';
import { ICodeGeneratorParameters } from '../interfaces/program-parameters/code-generator-parameters';
import { BaseProgram } from './base-program';
import { PROGRAMS_UI_EVENTS } from '../constants';

export class CodeGeneratorProgram extends BaseProgram {
  public readonly name = ProgramName.codeGenerator;
  public readonly isRepeatable = true;
  public readonly isAutoscalable = false;
  private _settingsState: ISettingsState;
  private _mainframeHardwareState: IMainframeHardwareState;
  private _mainframeDevelopingProgramsState: IMainframeDevelopingProgramsState;

  constructor(parameters: ICodeGeneratorParameters) {
    super(parameters);

    this._settingsState = parameters.settingsState;
    this._mainframeHardwareState = parameters.mainframeHardwareState;
    this._mainframeDevelopingProgramsState = parameters.mainframeDevelopingProgramsState;

    this._mainframeHardwareState.addStateEventListener(MAINFRAME_HARDWARE_STATE_EVENTS.HARDWARE_UPDATED, this.handleHardwareUpdate);
  }

  perform(threads: number): void {
    const delta = this.calculateDelta(threads, this._settingsState.updateInterval);

    this._mainframeDevelopingProgramsState.increaseDevelopingProgramCompletion(delta);
  }

  removeEventListeners() {
    this._mainframeHardwareState.removeStateEventListener(MAINFRAME_HARDWARE_STATE_EVENTS.HARDWARE_UPDATED, this.handleHardwareUpdate);
    this.uiEventBatcher.removeAllListeners();
    this.stateEventEmitter.removeAllListeners();
  }

  buildDescriptionParametersObject(threads: number) {
    const delta = this.calculateDelta(threads, MS_IN_SECOND);

    return {
      value: this.formatter.formatNumberLong(delta),
    };
  }

  private calculateDelta(threads: number, passedTime: number): number {
    return passedTime *
      constants.codeGenerator.baseIncrease *
      this._mainframeHardwareState.performance *
      threads *
      this.level *
      Math.pow(constants.codeGenerator.qualityMultiplier, this.quality);
  }

  private handleHardwareUpdate = () => {
    this.uiEventBatcher.enqueueEvent(PROGRAMS_UI_EVENTS.PROGRAM_UPDATED);
  };
}
