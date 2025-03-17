import { Schema } from "effect";

export const StringFromDate = Schema.DateFromSelf.pipe(
  Schema.transform(Schema.String, {
    decode: (from) =>
      new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(from)
        .replace(/\//g, "-"),
    encode: (to) => new Date(to),
  })
);

export class ProgressTable extends Schema.Class<ProgressTable>("ProgressTable")(
  {
    progressId: Schema.Number,
    dailyPrimogems: Schema.Number.pipe(Schema.nonNegative()),
    fates: Schema.Number.pipe(Schema.nonNegative()),
    primogems: Schema.Number.pipe(Schema.nonNegative()),
    fatesGoal: Schema.Number.pipe(Schema.nonNegative()),

    targetDate: Schema.optionalWith(Schema.DateFromString, {
      default: () => new Date(),
    }),
    genesisCrystals: Schema.optionalWith(
      Schema.Number.pipe(Schema.nonNegative()),
      { default: () => 0 }
    ),
  }
) {}

export class EventTable extends Schema.Class<EventTable>("EventTable")({
  eventId: Schema.Number,
  date: Schema.DateFromString,
  isApplied: Schema.Boolean,

  // NOTE: An event can be also "spending", so negative values are allowed
  fates: Schema.Number,
  primogems: Schema.Number,

  genesisCrystals: Schema.optionalWith(Schema.Number, { default: () => 0 }),
}) {}

export class HistoryTable extends Schema.Class<HistoryTable>("HistoryTable")({
  date: Schema.DateFromString,
  primogems: Schema.Number.pipe(Schema.nonNegative()),
}) {}

export class CharacterTable extends Schema.Class<CharacterTable>(
  "CharacterTable"
)({
  name: Schema.String,
}) {}

export class TeamTable extends Schema.Class<TeamTable>("TeamTable")({
  teamId: Schema.Number,
  characters: Schema.Tuple(
    Schema.String,
    Schema.String,
    Schema.String,
    Schema.String
  ),
}) {}
