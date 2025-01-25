import { Schema } from "effect";

export class ProgressTable extends Schema.Class<ProgressTable>("ProgressTable")(
  {
    progressId: Schema.Number,
    dailyPrimogems: Schema.Number.pipe(Schema.nonNegative()),
    fates: Schema.Number.pipe(Schema.nonNegative()),
    primogems: Schema.Number.pipe(Schema.nonNegative()),
    fatesGoal: Schema.Number.pipe(Schema.nonNegative()),
  }
) {}

export class EventTable extends Schema.Class<EventTable>("EventTable")({
  eventId: Schema.Number,
  date: Schema.DateFromString,
  isApplied: Schema.Boolean,

  // NOTE: An event can be also "spending", so negative values are allowed
  fates: Schema.Number,
  primogems: Schema.Number,
}) {}
