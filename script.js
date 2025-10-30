// Scoreboard functionality
let scores = {
    player1: 0,
    player2: 0
};

let playerCount = 2;
let flagsData = [];
let positionDropdownFunc = null;

// Update score function
function updateScore(player, change) {
    scores[player] = Math.max(0, scores[player] + change);
    const scoreElement = document.getElementById(player.replace('player', 'score'));
    if (scoreElement) {
        scoreElement.textContent = scores[player];
    }
}

// Reset scores
function resetScores() {
    Object.keys(scores).forEach(player => {
        scores[player] = 0;
        const playerNum = player.replace('player', '');
        const scoreElement = document.getElementById('score' + playerNum);
        if (scoreElement) {
            scoreElement.textContent = '0';
        }
    });
}

// Global function to initialize a player's flag selector
window.initializePlayerFlagSelector = function(playerNum) {
    if (!flagsData || flagsData.length === 0) {
        console.error('Flags data not loaded yet');
        return;
    }
    
    const dropdownsContainer = document.getElementById('dropdowns-container');
    
    // Create dropdown for this player
    const dropdown = document.createElement('div');
    dropdown.className = 'flag-dropdown';
    dropdown.id = `flagDropdown${playerNum}`;
    dropdown.innerHTML = `
        <div class="search-container">
            <input type="text" class="flag-search" placeholder="Search flags...">
        </div>
        <div class="flag-options" id="flagOptions${playerNum}"></div>
    `;
    dropdownsContainer.appendChild(dropdown);
    
    const flagButton = document.getElementById(`flag${playerNum}`);
    const flagOptions = document.getElementById(`flagOptions${playerNum}`);
    const flagSearch = dropdown.querySelector('.flag-search');
    
    if (!flagButton || !flagOptions) {
        console.error('Could not find elements for player', playerNum);
        return;
    }
    
    // Clear any existing options
    flagOptions.innerHTML = '';
    
    // Create and append flag options
    flagsData.forEach(flag => {
        const flagOption = document.createElement('div');
        flagOption.className = 'flag-option';
        flagOption.dataset.flag = flag.code;
        flagOption.dataset.name = flag.name;
        flagOption.title = flag.name;
        flagOption.textContent = `${flag.flag} ${flag.name}`;
        flagOption.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            flagButton.textContent = flag.flag;
            dropdown.classList.remove('show');
            if (flagSearch) {
                flagSearch.value = '';
            }
            const allOptions = flagOptions.querySelectorAll('.flag-option');
            allOptions.forEach(opt => opt.style.display = '');
        }, true);
        flagOptions.appendChild(flagOption);
    });

    // Toggle dropdown on button click
    flagButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const isOpen = dropdown.classList.contains('show');
        
        // Close all dropdowns first
        document.querySelectorAll('.flag-dropdown.show').forEach(dd => {
            if (dd !== dropdown) {
                dd.classList.remove('show');
            }
        });
        
        // Toggle current dropdown
        if (!isOpen) {
            dropdown.classList.add('show');
            if (positionDropdownFunc) {
                positionDropdownFunc(flagButton, dropdown);
            }
            if (flagSearch) {
                flagSearch.value = '';
                flagSearch.focus();
            }
            const options = flagOptions.querySelectorAll('.flag-option');
            options.forEach(option => {
                option.style.display = '';
            });
        } else {
            dropdown.classList.remove('show');
        }
    });
    
    // Search functionality
    flagSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const options = flagOptions.querySelectorAll('.flag-option');
        
        options.forEach(option => {
            const name = option.dataset.name.toLowerCase();
            const code = option.dataset.flag.toLowerCase();
            if (name.includes(searchTerm) || code.includes(searchTerm)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (dropdown.classList.contains('show') && positionDropdownFunc) {
            positionDropdownFunc(flagButton, dropdown);
        }
    });
};

// Add player function
function addPlayer() {
    playerCount++;
    const playerId = 'player' + playerCount;
    scores[playerId] = 0;
    
    const scoreboard = document.getElementById('scoreboard');
    const addButton = document.getElementById('addPlayerBtn');
    
    // Create new player card
    const playerCard = document.createElement('div');
    playerCard.className = 'player';
    playerCard.id = playerId;
    playerCard.dataset.playerNum = playerCount;
    playerCard.innerHTML = `
        <button class="btn-remove" onclick="removePlayer(${playerCount})" title="Remove Player">×</button>
        <div class="player-header">
            <div class="flag-selector-container">
                <button class="flag-button" id="flag${playerCount}" data-player="${playerId}">🌐</button>
            </div>
            <h2><span class="player-name" contenteditable="true">Player ${playerCount}</span></h2>
        </div>
        <div class="score-container">
            <button class="btn minus" onclick="updateScore('${playerId}', -1)">-</button>
            <span class="score" id="score${playerCount}">0</span>
            <button class="btn plus" onclick="updateScore('${playerId}', 1)">+</button>
        </div>
    `;
    
    // Insert before the add button
    scoreboard.insertBefore(playerCard, addButton);
    
    // Initialize flag selector for the new player
    if (flagsData.length > 0) {
        window.initializePlayerFlagSelector(playerCount);
    }
    
    console.log('Added player:', playerCount);
}

// Remove player function
function removePlayer(playerNum) {
    const playerId = 'player' + playerNum;
    const playerCard = document.getElementById(playerId);
    
    if (!playerCard) return;
    
    // Remove the player card
    playerCard.remove();
    
    // Remove the score
    delete scores[playerId];
    
    // Remove the dropdown if it exists
    const dropdown = document.getElementById('flagDropdown' + playerNum);
    if (dropdown) {
        dropdown.remove();
    }
    
    console.log('Removed player:', playerNum);
}

// Flag selector functionality
document.addEventListener('DOMContentLoaded', async function() {
    let flags = [];
    
    try {
        
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
        
        // Store flags data globally
        flagsData = flags;
        
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
        flagsData = flags;
        initializeFlagSelectors(flags);
    }

    // Create dropdown elements in the dropdowns container
    function createDropdowns() {
        const dropdownsContainer = document.getElementById('dropdowns-container');
        
        // Create dropdown for player 1
        const dropdown1 = document.createElement('div');
        dropdown1.className = 'flag-dropdown';
        dropdown1.id = 'flagDropdown1';
        dropdown1.innerHTML = `
            <div class="search-container">
                <input type="text" class="flag-search" placeholder="Search flags...">
            </div>
            <div class="flag-options" id="flagOptions1"></div>
        `;
        
        // Create dropdown for player 2
        const dropdown2 = document.createElement('div');
        dropdown2.className = 'flag-dropdown';
        dropdown2.id = 'flagDropdown2';
        dropdown2.innerHTML = `
            <div class="search-container">
                <input type="text" class="flag-search" placeholder="Search flags...">
            </div>
            <div class="flag-options" id="flagOptions2"></div>
        `;
        
        dropdownsContainer.appendChild(dropdown1);
        dropdownsContainer.appendChild(dropdown2);
    }

    // Position dropdown relative to button
    function positionDropdown(button, dropdown) {
        const buttonRect = button.getBoundingClientRect();
        
        // Use fixed positioning coordinates
        dropdown.style.top = `${buttonRect.bottom + 5}px`;
        dropdown.style.left = `${buttonRect.left}px`;
        
        // Ensure dropdown stays within viewport
        setTimeout(() => {
            const dropdownRect = dropdown.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            
            if (dropdownRect.right > viewportWidth) {
                dropdown.style.left = 'auto';
                dropdown.style.right = '20px';
            }
        }, 0);
    }
    
    // Store globally for new players
    positionDropdownFunc = positionDropdown;

    // Initialize flag selector for a single player
    function initializeFlagSelectorForPlayer(playerNum, flags) {
        console.log('Initializing flag selector for player', playerNum);
        
        const dropdownsContainer = document.getElementById('dropdowns-container');
        
        // Create dropdown for this player
        const dropdown = document.createElement('div');
        dropdown.className = 'flag-dropdown';
        dropdown.id = `flagDropdown${playerNum}`;
        dropdown.innerHTML = `
            <div class="search-container">
                <input type="text" class="flag-search" placeholder="Search flags...">
            </div>
            <div class="flag-options" id="flagOptions${playerNum}"></div>
        `;
        dropdownsContainer.appendChild(dropdown);
        
        // Initialize the selector
        initializeSinglePlayerSelector(playerNum, flags);
    }
    
    // Initialize selector logic for a player
    function initializeSinglePlayerSelector(playerId, flags) {
        const flagButton = document.getElementById(`flag${playerId}`);
        const dropdown = document.getElementById(`flagDropdown${playerId}`);
        const flagOptions = document.getElementById(`flagOptions${playerId}`);
        const flagSearch = dropdown.querySelector('.flag-search');
        
        if (!flagButton || !dropdown || !flagOptions) {
            console.error('Could not find elements for player', playerId);
            return;
        }
        
        // Clear any existing options
        flagOptions.innerHTML = '';
        
        console.log(`Creating ${flags.length} flag options for player ${playerId}`);
        
        // Create and append flag options
        flags.forEach(flag => {
            const flagOption = document.createElement('div');
            flagOption.className = 'flag-option';
            flagOption.dataset.flag = flag.code;
            flagOption.dataset.name = flag.name;
            flagOption.title = flag.name;
            flagOption.textContent = `${flag.flag} ${flag.name}`;
            flagOption.addEventListener('click', function(e) {
                console.log('Click detected on flag option:', flag.name);
                e.stopPropagation();
                e.preventDefault();
                console.log('Setting button to:', flag.flag);
                flagButton.textContent = flag.flag;
                console.log('Closing dropdown');
                dropdown.classList.remove('show');
                if (flagSearch) {
                    flagSearch.value = '';
                }
                // Show all options again
                const allOptions = flagOptions.querySelectorAll('.flag-option');
                allOptions.forEach(opt => opt.style.display = '');
            }, true);
            flagOptions.appendChild(flagOption);
        });
        
        console.log(`Added ${flagOptions.children.length} options to flagOptions${playerId}`);

        // Toggle dropdown on button click
        flagButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const isOpen = dropdown.classList.contains('show');
            
            // Close all dropdowns first
            document.querySelectorAll('.flag-dropdown.show').forEach(dd => {
                if (dd !== dropdown) {
                    dd.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            if (!isOpen) {
                console.log('Opening dropdown', playerId);
                dropdown.classList.add('show');
                positionDropdown(flagButton, dropdown);
                if (flagSearch) {
                    flagSearch.value = '';
                    flagSearch.focus();
                }
                // Show all options when dropdown is opened
                const options = flagOptions.querySelectorAll('.flag-option');
                console.log('Found', options.length, 'options in dropdown');
                options.forEach(option => {
                    option.style.display = '';
                });
            } else {
                console.log('Closing dropdown', playerId);
                dropdown.classList.remove('show');
            }
        });
        
        // Search functionality
        flagSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = flagOptions.querySelectorAll('.flag-option');
            
            options.forEach(option => {
                const name = option.dataset.name.toLowerCase();
                const code = option.dataset.flag.toLowerCase();
                if (name.includes(searchTerm) || code.includes(searchTerm)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (dropdown.classList.contains('show')) {
                positionDropdown(flagButton, dropdown);
            }
        });
    }
    
    // Initialize flag selectors
    function initializeFlagSelectors(flags) {
        console.log('Initializing flag selectors with', flags.length, 'flags');
        
        // Create dropdown elements
        createDropdowns();
        
        // Create dropdowns for each player
        const players = ['1', '2'];
        
        players.forEach(playerId => {
            initializeSinglePlayerSelector(playerId, flags);
        });
        
        // Global click outside handler
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.flag-dropdown') && !e.target.closest('.flag-button')) {
                document.querySelectorAll('.flag-dropdown.show').forEach(dd => {
                    dd.classList.remove('show');
                });
            }
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
