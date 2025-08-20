// 🌟 Enhanced GitHub Username Generator
// Professional JavaScript with advanced features

'use strict';

// Enhanced configuration object
const CONFIG = {
  GITHUB_API_BASE: 'https://api.github.com/users/',
  DEBOUNCE_DELAY: 800,
  ANIMATION_DELAY: 300,
  BATCH_SIZE: 3,
  BATCH_DELAY: 2000,
  MAX_RETRIES: 2,
  RATE_LIMIT_PER_MINUTE: 10,
  REQUEST_TIMEOUT: 8000,
  STATS_STORAGE_KEY: 'github_username_stats'
};

// Extended professional suffix pool
const suffixes = [
  // Development focused
  "dev", "codes", "tech", "engineer", "labs", "hq", "system",
  "cloud", "data", "works", "studio", "official", "solutions",
  "builds", "opensource", "digital", "stack", "core", "hub",
  "forge", "pro", "master", "ninja", "guru", "wizard",
  
  // Modern tech terms
  "api", "sdk", "cli", "app", "web", "mobile", "ai", "ml",
  "blockchain", "crypto", "fintech", "saas", "paas", "devops",
  
  // Professional suffixes
  "consulting", "agency", "group", "team", "collective", "network",
  "innovation", "ventures", "startup", "enterprise", "corporate",
  
  // Numbers and variations
  "01", "02", "03", "2024", "2025", "x", "io", "js", "py"
];

// Global state management
const state = {
  apiCallCount: 0,
  lastApiCall: 0,
  checkTimeout: null,
  isGenerating: false,
  isChecking: false,
  stats: {
    totalChecks: 0,
    totalGenerated: 0,
    totalAvailable: 0,
    sessionsCount: 1
  }
};

// ðŸŒŸ Utility Functions

/**
 * Enhanced Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Enhanced username validation following GitHub rules
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: "Username cannot be empty" };
  }

  const trimmed = username.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: "Username cannot be empty" };
  }
  
  if (trimmed.length > 39) {
    return { valid: false, error: "Username too long (max 39 characters)" };
  }
  
  if (trimmed.length === 1) {
    if (!/^[a-zA-Z0-9]$/.test(trimmed)) {
      return { valid: false, error: "Single character must be alphanumeric" };
    }
    return { valid: true };
  }
  
  // GitHub username rules: alphanumeric + hyphens, cannot start/end with hyphen
  const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  
  if (!githubUsernameRegex.test(trimmed)) {
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      return { valid: false, error: "Username cannot start or end with hyphen" };
    }
    return { valid: false, error: "Username can only contain letters, numbers, and hyphens" };
  }
  
  // Check for consecutive hyphens
  if (trimmed.includes('--')) {
    return { valid: false, error: "Username cannot contain consecutive hyphens" };
  }
  
  return { valid: true };
}

/**
 * Rate limiting check
 * @returns {boolean} - Whether API call is allowed
 */
function isRateLimited() {
  const now = Date.now();
  const timeSinceLastCall = now - state.lastApiCall;
  
  if (timeSinceLastCall < (60000 / CONFIG.RATE_LIMIT_PER_MINUTE)) {
    return true;
  }
  
  return false;
}

/**
 * Animate element entrance
 * @param {HTMLElement} element - Element to animate
 * @param {number} delay - Animation delay
 */
function animateIn(element, delay = 0) {
  setTimeout(() => {
    element.classList.add('show');
  }, delay);
}

/**
 * Create username result element with fixed overflow
 * @param {string} username - Username to display
 * @param {string} status - Status of username
 * @returns {HTMLElement} - Username result element
 */
function createUsernameElement(username, status = 'checking') {
  const usernameDiv = document.createElement('div');
  usernameDiv.className = 'username checking';
  
  const statusClass = status === 'available' ? 'available' : 
                     status === 'taken' ? 'taken' : 
                     status === 'error' ? 'error' : 'checking';
  
  const statusText = status === 'available' ? '✅ Available' : 
                    status === 'taken' ? '❌ Taken' : 
                    status === 'error' ? '⚠️ Error' : '🔍 Checking...';

  usernameDiv.innerHTML = `
    <span class="username-text">${username}</span>
    <div class="username-actions">
      <span class="status ${statusClass}">${statusText}</span>
      ${status === 'available' ? 
        `<button class="copy-btn" onclick="copyToClipboard('${username}', this)" title="Copy username">📋</button>` : 
        ''}
    </div>
  `;
  
  return usernameDiv;
}

/**
 * Check username availability via GitHub API
 * @param {string} username - Username to check
 * @returns {Promise<string>} - Status of username
 */
async function checkUsernameAvailability(username) {
  try {
    state.lastApiCall = Date.now();
    state.apiCallCount++;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(CONFIG.GITHUB_API_BASE + username, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 404) {
      return 'available';
    } else if (response.status === 200) {
      return 'taken';
    } else if (response.status === 403) {
      console.warn('GitHub API rate limit exceeded');
      return 'error';
    } else {
      return 'error';
    }
  } catch (error) {
    console.error('API Error:', error);
    return 'error';
  }
}

/**
 * Update username element status
 * @param {HTMLElement} element - Username element
 * @param {string} status - New status
 * @param {string} username - Username text
 */
function updateUsernameStatus(element, status, username) {
  element.classList.remove('checking');
  
  const statusElement = element.querySelector('.status');
  const actionsContainer = element.querySelector('.username-actions');
  
  const statusClass = status === 'available' ? 'available' : 
                     status === 'taken' ? 'taken' : 'error';
  
  const statusText = status === 'available' ? '✅ Available' : 
                    status === 'taken' ? '❌ Taken' : '⚠️ Error';

  statusElement.className = `status ${statusClass}`;
  statusElement.textContent = statusText;
  
  // Add copy button for available usernames
  if (status === 'available') {
    const existingBtn = actionsContainer.querySelector('.copy-btn');
    if (!existingBtn) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.title = 'Copy username';
      copyBtn.textContent = '📋';
      copyBtn.onclick = () => copyToClipboard(username, copyBtn);
      actionsContainer.appendChild(copyBtn);
    }
    
    // Update stats
    state.stats.totalAvailable++;
    updateStatsDisplay();
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Copy button element
 */
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = '✅';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    button.textContent = '❌';
    setTimeout(() => {
      button.textContent = '📋';
    }, 2000);
  }
}

/**
 * Generate username variations
 * @param {string} name - Base name
 * @returns {Array} - Array of username suggestions
 */
function generateUsernameVariations(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanName) return [];
  
  const variations = new Set();
  
  // Add base name
  variations.add(cleanName);
  
  // Add with suffixes
  const shuffledSuffixes = shuffle(suffixes);
  shuffledSuffixes.slice(0, 20).forEach(suffix => {
    variations.add(cleanName + suffix);
    if (Math.random() > 0.7) {
      variations.add(cleanName + '-' + suffix);
    }
  });
  
  // Add with prefixes
  ['the', 'mr', 'ms', 'dev', 'code'].forEach(prefix => {
    if (Math.random() > 0.8) {
      variations.add(prefix + cleanName);
      variations.add(prefix + '-' + cleanName);
    }
  });
  
  // Add with numbers
  for (let i = 1; i <= 5; i++) {
    const num = Math.floor(Math.random() * 999) + 1;
    variations.add(cleanName + num);
    if (Math.random() > 0.7) {
      variations.add(cleanName + '-' + num);
    }
  }
  
  // Add creative combinations
  const parts = cleanName.match(/.{1,4}/g) || [cleanName];
  if (parts.length > 1) {
    variations.add(parts.join('-'));
    variations.add(parts[0] + parts[parts.length - 1]);
  }
  
  // Convert to array and filter valid usernames
  const result = Array.from(variations)
    .filter(username => {
      const validation = validateUsername(username);
      return validation.valid && username.length <= 39;
    })
    .slice(0, 15); // Limit to 15 suggestions
  
  return shuffle(result);
}

/**
 * Batch check usernames with rate limiting
 * @param {Array} usernames - Usernames to check
 * @param {HTMLElement} resultsContainer - Container for results
 */
async function batchCheckUsernames(usernames, resultsContainer) {
  const batches = [];
  for (let i = 0; i < usernames.length; i += CONFIG.BATCH_SIZE) {
    batches.push(usernames.slice(i, i + CONFIG.BATCH_SIZE));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const progressIndicator = document.getElementById('progressIndicator');
    
    if (progressIndicator) {
      progressIndicator.style.display = 'block';
      progressIndicator.textContent = `Checking batch ${i + 1} of ${batches.length}... (${Math.round(((i + 1) / batches.length) * 100)}%)`;
    }
    
    const promises = batch.map(async username => {
      const element = resultsContainer.querySelector(`[data-username="${username}"]`);
      if (element) {
        const status = await checkUsernameAvailability(username);
        updateUsernameStatus(element, status, username);
        state.stats.totalChecks++;
      }
    });
    
    await Promise.allSettled(promises);
    
    // Wait between batches to respect rate limits
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY));
    }
  }
  
  if (document.getElementById('progressIndicator')) {
    document.getElementById('progressIndicator').style.display = 'none';
  }
  
  updateStatsDisplay();
  showStatsIfHidden();
}

/**
 * Main function to generate usernames
 */
async function generateUsernames() {
  const nameInput = document.getElementById('nameInput');
  const generateBtn = document.getElementById('generateBtn');
  const resultsContainer = document.getElementById('results');
  
  const name = nameInput.value.trim();
  
  if (!name) {
    showError('Please enter a name or keyword');
    nameInput.focus();
    return;
  }
  
  if (state.isGenerating) {
    return;
  }
  
  state.isGenerating = true;
  generateBtn.classList.add('loading');
  generateBtn.disabled = true;
  
  try {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Generate username variations
    const usernames = generateUsernameVariations(name);
    
    if (usernames.length === 0) {
      showError('Could not generate valid usernames from the provided input');
      return;
    }
    
    // Create username elements
    usernames.forEach((username, index) => {
      const usernameElement = createUsernameElement(username);
      usernameElement.setAttribute('data-username', username);
      resultsContainer.appendChild(usernameElement);
      animateIn(usernameElement, index * 100);
    });
    
    state.stats.totalGenerated += usernames.length;
    
    // Start batch checking
    await batchCheckUsernames(usernames, resultsContainer);
    
  } catch (error) {
    console.error('Generation error:', error);
    showError('An error occurred while generating usernames');
  } finally {
    state.isGenerating = false;
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
  }
}

/**
 * Check single username availability
 */
async function checkSingleUsername() {
  const input = document.getElementById('usernameCheckInput');
  const button = document.getElementById('checkUsernameBtn');
  const resultsContainer = document.getElementById('checkResults');
  
  const username = input.value.trim();
  
  if (!username) {
    showError('Please enter a username to check', resultsContainer);
    input.focus();
    return;
  }
  
  const validation = validateUsername(username);
  if (!validation.valid) {
    showError(validation.error, resultsContainer);
    input.classList.add('error');
    return;
  }
  
  input.classList.remove('error');
  
  if (state.isChecking) {
    return;
  }
  
  state.isChecking = true;
  button.classList.add('loading');
  button.disabled = true;
  
  try {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Create and display username element
    const usernameElement = createUsernameElement(username);
    resultsContainer.appendChild(usernameElement);
    animateIn(usernameElement, 100);
    
    // Check availability
    const status = await checkUsernameAvailability(username);
    updateUsernameStatus(usernameElement, status, username);
    
    state.stats.totalChecks++;
    if (status === 'available') {
      state.stats.totalAvailable++;
    }
    
    updateStatsDisplay();
    showStatsIfHidden();
    
  } catch (error) {
    console.error('Check error:', error);
    showError('An error occurred while checking the username', resultsContainer);
  } finally {
    state.isChecking = false;
    button.classList.remove('loading');
    button.disabled = false;
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {HTMLElement} container - Container to show error in
 */
function showError(message, container = null) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  if (container) {
    container.innerHTML = '';
    container.appendChild(errorDiv);
  } else {
    // Show in both containers if no specific container
    const checkResults = document.getElementById('checkResults');
    const results = document.getElementById('results');
    checkResults.innerHTML = '';
    checkResults.appendChild(errorDiv.cloneNode(true));
    results.innerHTML = '';
    results.appendChild(errorDiv);
  }
  
  // Auto-remove error after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

/**
 * Update stats display
 */
function updateStatsDisplay() {
  const checksCount = document.getElementById('checksCount');
  const generatedCount = document.getElementById('generatedCount');
  const availableCount = document.getElementById('availableCount');
  const successRate = document.getElementById('successRate');
  
  if (checksCount) checksCount.textContent = state.stats.totalChecks;
  if (generatedCount) generatedCount.textContent = state.stats.totalGenerated;
  if (availableCount) availableCount.textContent = state.stats.totalAvailable;
  if (successRate) {
    const rate = state.stats.totalChecks > 0 ? 
      Math.round((state.stats.totalAvailable / state.stats.totalChecks) * 100) : 0;
    successRate.textContent = rate + '%';
  }
}

/**
 * Show stats card if hidden
 */
function showStatsIfHidden() {
  const statsCard = document.getElementById('statsCard');
  if (statsCard && statsCard.style.display === 'none') {
    statsCard.style.display = 'block';
    animateIn(statsCard, 200);
  }
}

/**
 * Initialize application
 */
function initializeApp() {
  // Load saved stats
  try {
    const savedStats = localStorage.getItem(CONFIG.STATS_STORAGE_KEY);
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      state.stats = { ...state.stats, ...parsed };
    }
  } catch (error) {
    console.warn('Could not load saved stats:', error);
  }
  
  // Set up input event listeners for real-time validation
  const usernameInput = document.getElementById('usernameCheckInput');
  const nameInput = document.getElementById('nameInput');
  
  if (usernameInput) {
    usernameInput.addEventListener('input', (e) => {
      const validation = validateUsername(e.target.value);
      if (e.target.value.trim() && !validation.valid) {
        e.target.classList.add('error');
      } else {
        e.target.classList.remove('error');
      }
    });
    
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkSingleUsername();
      }
    });
  }
  
  if (nameInput) {
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateUsernames();
      }
    });
  }
  
  // Save stats periodically
  setInterval(() => {
    try {
      localStorage.setItem(CONFIG.STATS_STORAGE_KEY, JSON.stringify(state.stats));
    } catch (error) {
      console.warn('Could not save stats:', error);
    }
  }, 30000); // Every 30 seconds
  
  console.log('🌟 GitHub Username Generator initialized successfully!');
}

// Create debounced version of check function
const debouncedCheckUsername = debounce(checkSingleUsername, CONFIG.DEBOUNCE_DELAY);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}