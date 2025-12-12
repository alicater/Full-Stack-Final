import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function QuestForm({ onQuestCreated }) {
  const [name, setName] = useState("");
  const { fetchWithAuth } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      // Use fetchWithAuth for the POST request
      const newQuest = await fetchWithAuth('/api/quests/custom', {
          method: 'POST',
          body: JSON.stringify({ name }),
      });
      onQuestCreated(newQuest); // updates dashboard with new quest
      setName('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="quest-form">
      <input
        type="text"
        placeholder="Enter new quest name! "
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Create Custom Quest</button>
    </form>
  );
}

export default QuestForm;
