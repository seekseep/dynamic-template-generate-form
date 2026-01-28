/**
 * フォーム条件式
 */
export interface DynamicFormConditionExpression {
  field: string;
  value: any;
}

/**
 * フォーム条件（AND/OR）
 */
export interface DynamicFormCondition {
  and?: DynamicFormConditionExpression[];
  or?: DynamicFormConditionExpression[];
}

/**
 * フォームオプション
 */
export interface DynamicFormOption {
  value: string;
  label: string;
}

/**
 * フォームフィールド
 */
export interface DynamicFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options: DynamicFormOption[];
  condition: DynamicFormCondition | null;
}

/**
 * フォームセクション
 */
export interface DynamicFormSection {
  name: string;
  label: string;
  condition: DynamicFormCondition | null;
  fields: (DynamicFormField | DynamicFormField [])[];
}

/**
 * 動的フォーム
 */
export interface DynamicForm {
  sections: DynamicFormSection[];
}

/**
 * フォーム状態（セクション/フィールドの表示・必須情報）
 */
export interface FormStateEntry {
  type: 'section' | 'field';
  visibility: 'visible' | 'invisible';
  required?: boolean;
}

/**
 * フォーム全体の状態
 */
export type FormState = {
  [elementName: string]: FormStateEntry;
};

/**
 * テンプレートセクション
 */
export interface DynamicTemplateSection {
  name: string;
  label: string;
  condition: DynamicFormCondition | null;
  content: string;
}

/**
 * 動的テンプレート
 */
export interface DynamicTemplate {
  sections: DynamicTemplateSection[];
}

/**
 * フォーム設定（JSON入力形式）
 */
export interface FormConfig {
  sections: Array<{
    label: string;
    name?: string;
    condition?: DynamicFormCondition | Array<{ field: string; value: any }>;
    fields: Array<{
      label: string;
      name?: string;
      type?: string;
      required?: boolean;
      options?: string[] | Array<{ value: string; label: string }>;
      condition?: DynamicFormCondition | Array<{ field: string; value: any }>;
    }>;
  }>;
}

/**
 * テンプレート設定（JSON入力形式）
 */
export interface TemplateConfig {
  sections: Array<{
    label: string;
    name?: string;
    condition?: DynamicFormCondition | Array<{ field: string; value: any }>;
    content: string;
  }>;
}
