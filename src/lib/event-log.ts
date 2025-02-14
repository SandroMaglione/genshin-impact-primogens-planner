import {
  EventJournal,
  EventLog,
  EventLogEncryption,
} from "@effect/experimental";
import { Socket } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import {
  SettingEvents,
  SettingsCompactionLive,
  SettingsLive,
  SettingsReactivityLive,
} from "./settings";

export class AppEvents extends EventLog.schema(SettingEvents) {}

const EventLogLayer = EventLog.layer(AppEvents).pipe(
  Layer.provide([SettingsLive]),
  Layer.provide(EventJournal.layerIndexedDb())
);

const CompactionLive = Layer.mergeAll(
  SettingsCompactionLive,
  SettingsReactivityLive
).pipe(Layer.provide(EventLogLayer));

export const EventLogLive = Layer.mergeAll(EventLogLayer, CompactionLive).pipe(
  Layer.provide([
    EventLogEncryption.layerSubtle,
    Socket.layerWebSocketConstructorGlobal,
  ])
);

const makeClient = EventLog.makeClient(AppEvents);

export class EventLogClient extends Context.Tag("EventLogClient")<
  EventLogClient,
  Effect.Effect.Success<typeof makeClient>
>() {
  static readonly Default = Layer.effect(EventLogClient, makeClient);
}

// rx

// export const eventLogRx = Rx.runtime((get) =>
//   Effect.gen(function* () {
//     const identity = yield* get.some(identityRx);
//     return EventLogLive.pipe(
//       Layer.provideMerge(Layer.succeed(Identity, identity))
//     );
//   }).pipe(Layer.unwrapEffect)
// );

// export const clientRx = eventLogRx.rx(makeClient);
// export type EventClient = Rx.Rx.InferSuccess<typeof clientRx>;

// export const remoteAddressRx = localStorageRx("receipts_remote_address");

// export const remoteRx = Rx.runtime((get) =>
//   Effect.gen(function* () {
//     const identity = yield* get.some(identityRx);
//     const remoteAddress = yield* get.some(remoteAddressRx);
//     const url = new URL(remoteAddress);
//     url.searchParams.set("publicKey", identity.publicKey);
//     return EventLogRemote.layerWebSocketBrowser(url.toString()).pipe(
//       Layer.provide(get(eventLogRx.layer))
//     );
//   }).pipe(Layer.unwrapEffect)
// );
