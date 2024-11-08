import { APP_UI_EVENTS, AppStage } from '@state/app';
import { BaseController } from '@shared/base-controller';

export class AppRootController extends BaseController {
  hostConnected() {
    this.app.addUiEventListener(APP_UI_EVENTS.CHANGED_APP_STAGE, this.handleRefreshUI);
    this.app.startUp().catch((e) => {
      console.error(e);
    });
  }

  hostDisconnected() {
    this.app.removeUiEventListener(APP_UI_EVENTS.CHANGED_APP_STAGE, this.handleRefreshUI);
  }

  get appStage(): AppStage {
    return this.app.appStage;
  }
}
