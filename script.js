// Scoreboard functionality
let scores = {
    player1: 0,
    player2: 0
};

// Update score function
function updateScore(player, change) {
    scores[player] = Math.max(0, scores[player] + change);
    document.getElementById(player === 'player1' ? 'score1' : 'score2').textContent = scores[player];
}

// Reset scores
function resetScores() {
    scores.player1 = 0;
    scores.player2 = 0;
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
}

// Flag selector functionality
document.addEventListener('DOMContentLoaded', function() {
    // Flag data (simplified for brevity)
    const flags = [
        { flag: '🇺🇸', name: 'United States' },
        { flag: '🇬🇧', name: 'United Kingdom' },
        { flag: '🇨🇦', name: 'Canada' },
        { flag: '🇦🇺', name: 'Australia' },
        { flag: '🇩🇪', name: 'Germany' },
        { flag: '🇫🇷', name: 'France' },
        { flag: '🇯🇵', name: 'Japan' },
        { flag: '🇧🇷', name: 'Brazil' }
    ];

    // Initialize flag selectors for both players
    ['1', '2'].forEach(playerNum => {
        const flagButton = document.getElementById(`flag${playerNum}`);
        const flagDropdown = document.getElementById(`flagDropdown${playerNum}`);
        const flagOptions = document.getElementById(`flagOptions${playerNum}`);
        const searchInput = flagDropdown.querySelector('.flag-search');

        // Toggle dropdown
        flagButton.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.flag-dropdown').forEach(dd => {
                if (dd !== flagDropdown) dd.style.display = 'none';
            });
            flagDropdown.style.display = flagDropdown.style.display === 'block' ? 'none' : 'block';
            
            // Focus search input when dropdown is shown
            if (flagDropdown.style.display === 'block') {
                searchInput.focus();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!flagDropdown.contains(e.target) && e.target !== flagButton) {
                flagDropdown.style.display = 'none';
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredFlags = flags.filter(flag => 
                flag.name.toLowerCase().includes(searchTerm)
            );
            renderFlagOptions(filteredFlags, playerNum);
        });

        // Initial render of flag options
        renderFlagOptions(flags, playerNum);
    });

    // Render flag options
    function renderFlagOptions(flagList, playerNum) {
        const flagOptions = document.getElementById(`flagOptions${playerNum}`);
        flagOptions.innerHTML = '';
        
        flagList.forEach(flag => {
            const option = document.createElement('div');
            option.className = 'flag-option';
            option.textContent = flag.flag;
            option.title = flag.name;
            option.onclick = () => {
                document.getElementById(`flag${playerNum}`).textContent = flag.flag;
                document.getElementById(`flagDropdown${playerNum}`).style.display = 'none';
            };
            flagOptions.appendChild(option);
        });
    }
});
