export abstract class Model<Props extends { id: string }> {
  protected constructor(protected _props: Props) {}

  get id() {
    return this._props.id
  }
}
