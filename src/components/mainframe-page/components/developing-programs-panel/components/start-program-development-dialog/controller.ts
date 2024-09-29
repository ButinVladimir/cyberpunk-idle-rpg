import { GENERAL_STATE_UI_EVENTS } from '@state/general-state/constants';
import { MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS } from '@state/mainframe-owned-programs-state';
import { PROGRAMS_UI_EVENTS } from '@state/progam-factory/constants';
import { BaseController } from '@shared/base-controller';
import { ProgramName } from '@state/progam-factory/types';
import { IProgram } from '@state/progam-factory/interfaces/program';
import { IDevelopingProgram } from '@state/mainframe-developing-programs-state';

export class StartProgramDevelopmentDialogController extends BaseController {
  private _selectedProgram?: IProgram;

  hostConnected() {
    this.generalState.addUiEventListener(GENERAL_STATE_UI_EVENTS.CITY_LEVEL_CHANGED, this.handleRefreshUI);
    this.mainframeOwnedProgramState.addUiEventListener(
      MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS.OWNED_PROGRAMS_UPDATED,
      this.handleRefreshUI,
    );
  }

  hostDisconnected() {
    this.generalState.removeUiEventListener(GENERAL_STATE_UI_EVENTS.CITY_LEVEL_CHANGED, this.handleRefreshUI);
    this.mainframeOwnedProgramState.removeUiEventListener(
      MAINFRAME_OWNED_PROGRAMES_STATE_UI_EVENTS.OWNED_PROGRAMS_UPDATED,
      this.handleRefreshUI,
    );

    if (this._selectedProgram) {
      this.programFactory.deleteProgram(this._selectedProgram);
    }
  }

  get cityLevel(): number {
    return this.generalState.cityLevel;
  }

  getSelectedProgram(name: ProgramName, level: number, quality: number): IProgram {
    if (
      this._selectedProgram?.name !== name ||
      this._selectedProgram.level !== level ||
      this._selectedProgram.quality !== quality
    ) {
      if (this._selectedProgram) {
        this.programFactory.deleteProgram(this._selectedProgram);
      }

      this._selectedProgram = this.programFactory.makeProgram({
        name,
        level,
        quality,
      });

      this._selectedProgram.addUiEventListener(PROGRAMS_UI_EVENTS.PROGRAM_UPDATED, this.handleRefreshUI);
    }

    return this._selectedProgram;
  }

  getOwnedProgram(name: ProgramName): IProgram | undefined {
    return this.mainframeOwnedProgramState.getOwnedProgramByName(name);
  }

  getDevelopingProgram(name: ProgramName): IDevelopingProgram | undefined {
    return this.mainframeDevelopingProgramsState.getDevelopingProgramByName(name);
  }

  startDevelopingProgram(name: ProgramName, level: number, quality: number): boolean {
    return this.mainframeDevelopingProgramsState.addDevelopingProgram({
      name,
      level,
      quality,
    });
  }

  private handleRefreshUI = () => {
    this.host.requestUpdate();
  };
}
