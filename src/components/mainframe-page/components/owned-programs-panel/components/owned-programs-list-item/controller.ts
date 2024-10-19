import { BaseController } from '@shared/base-controller';
import { IProgram } from '@state/progam-factory/interfaces/program';
import { PROGRAMS_UI_EVENTS } from '@state/progam-factory/constants';
import { ProgramName } from '@state/progam-factory/types';

export class OwnedProgramsListItemController extends BaseController {
  private _ownedProgram?: IProgram;

  hostConnected() {
    this.addProgramListeners();
  }

  hostDisconnected() {
    this.removeProgramListeners();
  }

  getProgram(programName: ProgramName) {
    if (this._ownedProgram?.name !== programName) {
      this.removeProgramListeners();

      this._ownedProgram = this.mainframeOwnedProgramState.getOwnedProgramByName(programName);

      this.addProgramListeners();
    }

    return this._ownedProgram;
  }

  private handleRefreshUI = () => {
    this.host.requestUpdate();
  };

  private addProgramListeners() {
    this._ownedProgram?.addUiEventListener(PROGRAMS_UI_EVENTS.PROGRAM_UPDATED, this.handleRefreshUI);
  }

  private removeProgramListeners() {
    this._ownedProgram?.removeUiEventListener(PROGRAMS_UI_EVENTS.PROGRAM_UPDATED, this.handleRefreshUI);
  }
}