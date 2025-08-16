import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Outlet, Navigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";



/**
 * Guard: kaliya u ogolow users leh role: 'admin'
 * Waxaannu ku eeganeynaa collection 'users/{uid}' { role: 'admin' }
 * (ama waxaad ku adkeyn kartaa email gaar ah hoos)
 */



const ALLOWED_ADMIN_EMAILS = ["admin@gmail.com"]; // sida Flutter-ka

export default function RequireAdmin() {
  const [state, setState] = useState({ loading: true, allow: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return setState({ loading: false, allow: false });

      // 1) email whitelist
      if (ALLOWED_ADMIN_EMAILS.includes(u.email || "")) {
        return setState({ loading: false, allow: true });
      }

      // 2) optional: role check from Firestore
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.exists() ? snap.data().role : null;
      setState({ loading: false, allow: role === "admin" });
    });
    return () => unsub();
  }, []);

  if (state.loading) return <Loader />;
  return state.allow ? <Outlet /> : <Navigate to="/login" replace />;
}
