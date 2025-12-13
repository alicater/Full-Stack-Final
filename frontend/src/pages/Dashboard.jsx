import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QuestList from '../components/QuestList';
import QuestForm from '../components/QuestForm';
import JournalEntry from '../components/JournalEntry'; 

function Dashboard() {
    const { user, fetchWithAuth } = useAuth();
    const [quests, setQuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [currentDay, setCurrentDay] = useState(1);
    const [xp, setXp] = useState(user?.xp || 0);
    const [progressStats, setProgress] = useState({ 
        totalQuests: 0, 
        completedQuests: 0 
    });
    const [showMenu, setShowMenu] = useState(false);
    const [nextQuestIndex, setNextQuestIndex] = useState(0);

    useEffect(() => { // adding background class
        document.body.classList.add('dashboard-body');
        return () => document.body.classList.remove('dashboard-body');
    }, []);

    const resetDay = async () => {
    if (window.confirm("Return to Day 1? Your XP will be reset to 0, and all Main quests will be reactivated.")) {
        try {
            await fetchWithAuth('/api/quests/reset-day', { method: 'POST' });
            // updating user stats
            setXp(0); 
            setCurrentDay(1); // Set the day back to 1
            setShowMenu(false);

            fetchQuests(); 
            fetchProgress();

        } catch (error) {
            console.error("Failed to reset day and XP:", error);
        }
    }
}

    const fetchUserData = useCallback(async () => {
        try {
            const userData = await fetchWithAuth('/api/auth/me');
            setXp(userData.xp);
        } catch (error) {
            console.error(error);
        }
    }, [fetchWithAuth]);

    const fetchQuests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth(`/api/quests?day=${currentDay}`); // gathers quests just from that specific day
            setQuests(data);
        } catch (error) {
            console.error('Failed to fetch quests: ', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithAuth, currentDay]); // dependency array depends also on which day it is

    const fetchProgress = useCallback(async () => {
        try{
            const data = await fetchWithAuth('/api/progress');
            setProgress(data);
        } catch (error) {
            console.error('Failed to fetch user progress: ', error.message);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        if (user) {
            fetchQuests(); // gathers the quests
            fetchProgress(); // gathers the progress everytime user state/day changes
            fetchUserData(); // gathers user xp
        }
    }, [user, currentDay, fetchQuests, fetchProgress, fetchUserData]);

    // when quest list changes (completed or new day), resets view to the top
    useEffect(() => {
        setNextQuestIndex(0);
    }, [quests]);

    // handles pivot logit, meaning it goes to the next quest and cycles back to 0 if at the end
    const handlePivot = () => {
        if (quests.length > 1) {
            setNextQuestIndex((prevIndex) => (prevIndex + 1) % quests.length);
        }
    };

    // handles progress percent
    const progressPercent = progressStats.totalQuests > 0
        ? Math.round((progressStats.completedQuests/progressStats.totalQuests) *100)
        : 0;

    // handles when a new quest is created successfuly
    const handleQuestCreated = (newQuest) => {
        setQuests((prevQuests) => [...prevQuests, newQuest]);
        fetchProgress(); // updates progress immediately
    };

    // handles when quest is finished
    const handleQuestCompleted = async (completedQuestId) => {
        try {
        await fetchWithAuth(`/api/quests/${completedQuestId}/complete`, {
            method: 'PATCH',
        });
        setQuests((prevQuests) => prevQuests.filter(q => q._id !== completedQuestId));
        setXp((prevXp) => prevXp + 10); 
        fetchProgress(); 

        } catch (error) {
            console.error('Failed to complete quest:', error.message);
        }
    };

    const nextDay = () => {
        if (currentDay < 14) {
            setCurrentDay(currentDay +1);
        }
    }

    // gets specific quest to display on the index, using chaining in case the array is empty
    const currentNextQuest = quests[nextQuestIndex]; 
    if (isLoading) return <h2>Loading Quests...</h2>;

    return (
        <>
            {user && ( // wrapper makes sure the user name is loaded in header
                <div className="header-info">
                    <div className="user-stats">
                        <p style={{marginLeft: '20px'}}>User: {user?.username}</p>
                        <p className="points">Points: {xp} XP</p> 
                    </div>
                    
                    <div className="day-indicator">
                        Day {currentDay} / 14
                    </div>
                    
                    <div className="profile-wrapper">
                        <div className="profile-circle" onClick={() => setShowMenu(!showMenu)}></div>
                        {showMenu && (
                            <div className="profile-dropdown">
                                <button onClick={resetDay}>Reset to Day 1</button>
                                <button onClick={() => { window.location.href = '/login'; }}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            

            {/* Main Dashboard Grid */}
            <div className="dashboard-grid"> 
                {/* Quest Board */}
                <div className="quest-board-container">
                    <h2>Quest Board</h2>
                    <QuestForm onQuestCreated={handleQuestCreated} />
                    <QuestList quests={quests} onQuestCompleted={handleQuestCompleted} />
                </div>

                {/* Story Panel */}
                <JournalEntry currentDay={currentDay} />

                {/* Next Quest */}
                <div className="next-quest-container">
                    <h2>Next Quest!</h2>
                    {quests.length > 0 && currentNextQuest ? (
                        <div>
                            <p>{currentNextQuest.name}</p>
                            <button className="complete-button" 
                                onClick={() => handleQuestCompleted(currentNextQuest._id)}>
                                Complete
                            </button>
                            <button className="pivot-button" onClick={handlePivot}>Pivot</button>
                            <button className="pivot-button" onClick={nextDay}>Go to Next Day</button>
                        </div>
                    ):(
                        <div>
                            <p>You've completed all quests for Day {currentDay}!</p>
                            <button className="pivot-button" onClick={nextDay}>Go to Next Day</button>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <h3>Progress</h3>
                    <div className="progress-bar-shell">
                        {/* Only renders progress bar if percent is more than 0 */}
                        {progressPercent > 0 && (
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
                                {progressPercent}% Complete
                            </div>
                        )}
                        
                        {/* displays the text when percent is 0 */}
                        {progressPercent === 0 && (
                            <div className="progress-text-overlay">
                                {progressPercent}% Complete
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;