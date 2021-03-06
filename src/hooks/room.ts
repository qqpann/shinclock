import { db } from "src/api/firebase";
import {
  collection,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  doc,
  setDoc,
  PartialWithFieldValue,
} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

/**
 * Room
 * ----
 * @property {string} name - Room name
 */
export type Room = {
  id: string;
  ref: DocumentReference;
  name: string;
};
const roomConverter: FirestoreDataConverter<Room> = {
  toFirestore(room: WithFieldValue<Room>): DocumentData {
    return {
      name: room.name,
    };
  },
  fromFirestore(snapshot, options?): Room {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      name: data.name,
    };
  },
};

export const roomsRef = collection(db, "rooms").withConverter(roomConverter);

export const useRooms = () => {
  const create = async (specified: Partial<Room>) => {
    const docRef = doc(roomsRef, specified.id);
    await setDoc(docRef, { name: "New clock", ...specified }, { merge: true });
    return docRef;
  };
  const get = (id: string) => {};
  return { create, get };
};

export const useRoom = (roomId: string | undefined) => {
  const roomRef = doc(roomsRef, roomId ?? "_");
  const [room, loading, error, snapshot] = useDocumentData(roomRef);
  return { room, loading };
};
