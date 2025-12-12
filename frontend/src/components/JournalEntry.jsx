import React from 'react';
import StoryDay from './StoryDay';

function JournalEntry({ currentDay }) {
    return (
        <div className="story-container">
            <StoryDay day={currentDay} />
        </div>
    );
}

export default JournalEntry;