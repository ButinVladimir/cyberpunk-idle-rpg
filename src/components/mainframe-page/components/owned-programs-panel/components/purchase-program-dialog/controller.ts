import { BaseController } from '@shared/base-controller';
import { IProgram } from '@state/progam-factory/interfaces/program';
import { ProgramName } from '@state/progam-factory/types';
import { PROGRAM_UI_EVENTS } from '@/state/progam-factory/constants';

export class PurchaseProgramDialogController extends BaseController {
  private _selectedProgram?: IProgram;

  hostConnected() {}

  hostDisconnected() {
    if (this._selectedProgram) {
      this.programFactory.deleteProgram(this._selectedProgram);
    }
  }

  getProgram(name: ProgramName, level: number, quality: number): IProgram {
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

      this._selectedProgram.addUiEventListener(PROGRAM_UI_EVENTS.PROGRAM_UPDATED, this.handleRefreshUI);
    }

    return this._selectedProgram;
  }

  purchaseProgram(name: ProgramName, level: number, quality: number): boolean {
    return this.mainframeOwnedProgramState.purchaseProgram({
      name,
      level,
      quality,
    });
  }

  handleRefreshUI = () => {
    this.host.requestUpdate();
  };
}
