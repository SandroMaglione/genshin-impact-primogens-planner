import { Schema } from "effect";

export class ProgressTable extends Schema.Class<ProgressTable>("ProgressTable")(
  {
    progressId: Schema.Number,
    dailyPrimogems: Schema.Number.pipe(Schema.nonNegative()),
    fates: Schema.Number.pipe(Schema.nonNegative()),
    primogems: Schema.Number.pipe(Schema.nonNegative()),
  }
) {}
