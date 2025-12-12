import React from 'react';
import { journal_entries } from './Story'; 

function StoryDay({ day }) {
    // Retrieve the entry for the current day, or a default message
    const entry = journal_entries[day] || {
        title: `Day ${day} Log`,
        text: "The path ahead is unwritten. You must chart your own course until the next chapter of the Great Journal is revealed."
    };

    return (
        <>
            <h2>{entry.title}</h2>
            <p style={{ color: '#291a10', lineHeight: '1.5' }}>
                {entry.text}
            </p>
        </>
    );
}

export default StoryDay;