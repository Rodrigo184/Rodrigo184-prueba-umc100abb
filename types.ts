
export interface ComponentOption {
  id: string;
  label: string;
  description: string;
  orderCode: string;
  isMandatory?: boolean;
}

export interface Section {
  id: string;
  title: string;
  question: string;
  isMultiple: boolean;
  options: ComponentOption[];
  isOptional?: boolean;
}

export interface SelectionState {
  [key: string]: string | string[];
}
