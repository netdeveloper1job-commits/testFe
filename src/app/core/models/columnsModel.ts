export interface columnsModel {
  caption: string;
  dataField: string;
  isTemplate: Boolean;
  style?: {};
  isHeaderTemplate?: boolean;
  isTooltip?: boolean;
  visible?:boolean | (() => boolean);
}
