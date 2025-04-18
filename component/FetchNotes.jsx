import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DeleteNote from "./DeleteNote";

const FetchNotes = () => {
  const [notes, setNotes] = useState([]);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("User not logged in.");
        setNotes([]); 
        return;
      }

      const colRef = collection(db, "keepSterData");
      const userQuery = query(colRef, where("uid", "==", user.uid));

      const unsubscribeSnapshot = onSnapshot(
        userQuery,
        (snapshot) => {
          const notesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotes(notesData);
        },
        (error) => {
          console.error("Error fetching notes: ", error);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="noteContainer">
      {notes.length > 0 ? (
        notes.map((note) => (
          <div className="note" key={note.id}
          title={
            note.createdAt?.toDate
              ? new Date(note.createdAt.toDate()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No date"
          }
          > 
    
            <div className="noteHeader">
             <strong><h4>{note.title}</h4> </strong>
              <div className="flex">
                <DeleteNote noteId={note.id} />
              </div>
            </div>
            <div
              className="noteContent"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        ))
      ) : (
        <div className="notes-empty">
          <p>No notes available.</p>
        </div>
      )}
    </div>
  );
};

export default FetchNotes;
