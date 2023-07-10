import { DateState } from '..//enum/data-state.enum';

export interface AppState<T> {
  dataState?: DateState;
  appData?: T;
  error?: string;
}
