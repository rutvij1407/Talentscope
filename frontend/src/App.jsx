import { useState } from "react";
import TalentScopeDashboard from "./TalentScopeDashboard.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <LoadingScreen onFinish={() => setLoading(false)} minDuration={600} />
      {!loading && <TalentScopeDashboard />}
    </>
  );
}

