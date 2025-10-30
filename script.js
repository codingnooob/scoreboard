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
document.addEventListener('DOMContentLoaded', async function() {
    let flags = [];
    
    // Add a loading state
    const setLoading = (isLoading) => {
        document.querySelectorAll('.flag-options').forEach(el => {
            el.innerHTML = isLoading ? '<div class="loading">Loading countries...</div>' : '';
        });
    };
    
    try {
        setLoading(true);
        
        // First try: Fetch from CDN
        try {
            const cdnResponse = await fetch('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/by-code.json');
            if (cdnResponse.ok) {
                const countries = await cdnResponse.json();
                // Transform the CDN response to match our expected format
                flags = Object.entries(countries).map(([code, data]) => ({
                    flag: data.emoji,
                    name: data.name,
                    code: code.toLowerCase()
                }));
            } else {
                throw new Error('CDN fetch failed');
            }
        } catch (cdnError) {
            console.log('CDN fetch failed, falling back to REST API');
            // Fallback to REST Countries API if CDN fails
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
            const countries = await response.json();
            
            // Transform the REST API response to match our expected format
            flags = countries.map(country => ({
                flag: country.flag,
                name: country.name.common,
                code: country.cca2.toLowerCase()
            }));
        }
        
        // Sort flags alphabetically by country name
        flags.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add a default 'World' option
        flags.unshift({ flag: '🌐', name: 'World', code: 'world' });
        
        // Initialize the flag selectors with the loaded data
        initializeFlagSelectors(flags);
        
    } catch (error) {
        console.error('Error fetching countries from all sources:', error);
        // Fallback to a minimal set of flags if all API calls fail
        flags = [
            { flag: '🌐', name: 'World', code: 'world' },
            { flag: '🇺🇸', name: 'United States', code: 'us' },
            { flag: '🇬🇧', name: 'United Kingdom', code: 'gb' },
            { flag: '🇨🇦', name: 'Canada', code: 'ca' },
            { flag: '🇦🇺', name: 'Australia', code: 'au' },
            { flag: '🇩🇪', name: 'Germany', code: 'de' },
            { flag: '🇫🇷', name: 'France', code: 'fr' },
            { flag: '🇯🇵', name: 'Japan', code: 'jp' },
            { flag: '🇨🇳', name: 'China', code: 'cn' },
            { flag: '🇧🇷', name: 'Brazil', code: 'br' }
        ];
        initializeFlagSelectors(flags);
    } finally {
        setLoading(false);
    }

    // Initialize flag selectors with the provided flags
    function initializeFlagSelectors(flags) {
        ['1', '2'].forEach(playerNum => {
            const flagButton = document.getElementById(`flag${playerNum}`);
            const flagDropdown = document.getElementById(`flagDropdown${playerNum}`);
            const flagOptions = document.getElementById(`flagOptions${playerNum}`);
            const searchInput = flagDropdown.querySelector('.flag-search');

            // Toggle dropdown
            flagButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = flagDropdown.style.display === 'block';
                
                // Close all dropdowns first
                document.querySelectorAll('.flag-dropdown').forEach(dd => {
                    dd.style.display = 'none';
                });
                
                // Toggle this dropdown if it wasn't open
                if (!isOpen) {
                    // Position the dropdown relative to the flag button
                    const rect = flagButton.getBoundingClientRect();
                    flagDropdown.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                    flagDropdown.style.left = (rect.left + window.scrollX) + 'px';
                    flagDropdown.style.display = 'block';
                    searchInput.focus();
                }
            });

            // Close dropdown when clicking outside
            const handleClickOutside = (e) => {
                if (!flagDropdown.contains(e.target) && 
                    e.target !== flagButton && 
                    !flagButton.contains(e.target)) {
                    flagDropdown.style.display = 'none';
                }
            };
            
            // Use capturing phase to ensure this runs before other click handlers
            document.addEventListener('click', handleClickOutside, true);
            
            // Cleanup event listener when component unmounts (if needed)
            // This would be more important in a framework like React
            // For vanilla JS, this is a simplified version

            // Search functionality
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredFlags = flags.filter(flag => 
                    flag.name.toLowerCase().includes(searchTerm) || 
                    (flag.code && flag.code.toLowerCase().includes(searchTerm))
                );
                renderFlagOptions(filteredFlags, playerNum);
            });

            // Initial render of flag options
            renderFlagOptions(flags, playerNum);
        });
    }

    // Render flag options
    function renderFlagOptions(flagList, playerNum) {
        const flagOptions = document.getElementById(`flagOptions${playerNum}`);
        flagOptions.innerHTML = '';
        
        if (flagList.length === 0) {
            flagOptions.innerHTML = '<div class="no-results">No countries found</div>';
            return;
        }
        
        flagList.forEach(flag => {
            const option = document.createElement('div');
            option.className = 'flag-option';
            option.innerHTML = `${flag.flag} <span>${flag.name}</span>`;
            option.title = flag.name;
            option.onclick = () => {
                document.getElementById(`flag${playerNum}`).textContent = flag.flag;
                document.getElementById(`flagDropdown${playerNum}`).style.display = 'none';
                // Clear search input when a flag is selected
                document.querySelector(`#flagDropdown${playerNum} .flag-search`).value = '';
                // Reset to show all flags
                renderFlagOptions(flagList, playerNum);
            };
            flagOptions.appendChild(option);
        });
    }
});
