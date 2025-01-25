export interface TypedFormData<Tag extends string> extends FormData {
  /** @internal */
  readonly _tag: Tag;
}
