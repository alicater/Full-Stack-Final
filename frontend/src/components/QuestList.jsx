import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";

function QuestList({ quests, onQuestCompleted }) {
  const {fetchWithAuth} = useAuth();

  const completeQuest = async (id) => {
    try {
      // Use fetchWithAuth for the PATCH request
      await fetchWithAuth(`/api/quests/${id}/complete`, {
        method: 'PATCH',
      });
      onQuestCompleted(id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="quest-list">
      {quests.length > 0 ? (
        <ul>
          {quests.map((quest) => (
            <li key={quest._id} className="quest-item">
              <span className="quest-name">{quest.name}</span>
              <button
                onClick={() => completeQuest(quest._id)}
                className="complete-button"
              >
                <FaCheckCircle /> Complete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No active quests! Time to create some or take time to recover!</p>
      )}
    </div>
  );
}

export default QuestList;
