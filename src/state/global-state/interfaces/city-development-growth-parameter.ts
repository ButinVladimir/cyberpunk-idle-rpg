import { IUIEventEmitter } from '@shared/interfaces/ui-event-emitter';
import { IncomeSource } from '@shared/types';

export interface ICityDevelopmentGrowthParameter extends IUIEventEmitter {
  totalGrowth: number;
  getGrowth(incomeSource: IncomeSource): number;
  requestRecalculation(): void;
  recalculate(): void;
}
