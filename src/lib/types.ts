export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export interface TypedFormData<Tag extends string> extends FormData {
  /** @internal */
  readonly _tag: Tag;
}
