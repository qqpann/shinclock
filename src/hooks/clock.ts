import { db } from "src/api/firebase";
import {
  collection,
  Timestamp,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  doc,
  setDoc,
  DocumentReference,
  deleteDoc,
  updateDoc,
  PartialWithFieldValue,
  increment,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

/**
 * Clock
 * -----
 * @property {string} name - The clock name
 * @property {boolean} running - Is the clock running right now
 * @property {Timestamp} start_at - The current run started at
 * @property {number} num_resets - How many times it is reset
 * @property {number} seconds_passed - Seconds remaining until end
 * @property {number} total_seconds - Total of the timer in seconds
 */
export type Clock = {
  id: string;
  ref: DocumentReference;
  name: string;
  running: boolean;
  start_at: Timestamp;
  num_resets: number;
  total_seconds: number;
  seconds_passed: number;
};

const clockConverter: FirestoreDataConverter<Clock> = {
  toFirestore(clock: WithFieldValue<Clock>): DocumentData {
    return {
      name: clock.name,
      running: clock.running,
      start_at: clock.start_at,
      num_resets: clock.num_resets,
      seconds_passed: clock.seconds_passed,
      total_seconds: clock.total_seconds,
    };
  },
  fromFirestore(snapshot, options?): Clock {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      name: data.name,
      running: data.running,
      start_at: data.start_at,
      num_resets: data.num_resets,
      seconds_passed: data.seconds_passed,
      total_seconds: data.total_seconds,
    };
  },
};

export const useClocks = (roomId: string | undefined) => {
  const clocksRef = collection(
    db,
    "rooms",
    roomId ?? "_",
    "clocks"
  ).withConverter(clockConverter);

  const [clocks, loading, error, snapshot] = useCollectionData(clocksRef);

  const create = (specified: PartialWithFieldValue<Clock>) => {
    if (!roomId) return;
    return setDoc(
      doc(clocksRef),
      {
        name: "New clock",
        running: false,
        start_at: Timestamp.now(),
        total_seconds: 5,
        seconds_passed: 0,
        num_resets: 0,
        ...specified,
      },
      { merge: true }
    );
  };
  const get = (id: string) => {};
  return { create, get, clocks };
};

export const useClock = (clock: Clock) => {
  const start = () => {
    updateDoc(clock.ref, { running: true, start_at: Timestamp.now() });
  };
  const stop = () => {
    const seconds_passed =
      clock.seconds_passed + (Date.now() - clock.start_at.toMillis()) / 1000;
    updateDoc(clock.ref, { running: false, seconds_passed });
  };
  const reset = () => {
    updateDoc(clock.ref, {
      running: false,
      seconds_passed: 0,
      num_resets: increment(1),
    });
  };
  const remove = () => {
    deleteDoc(clock.ref);
  };

  return { start, stop, reset, remove };
};
