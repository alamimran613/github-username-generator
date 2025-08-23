// 🌟 Enhanced GitHub Username Generator - FIXED VERSION
// Professional JavaScript with improved rate limiting and error handling

"use strict";

// Enhanced configuration object
const CONFIG = {
  GITHUB_API_BASE: "https://api.github.com/users/",
  DEBOUNCE_DELAY: 800,
  ANIMATION_DELAY: 300,
  BATCH_SIZE: 2, // Reduced from 3 to be more conservative
  BATCH_DELAY: 3000, // Increased from 2000ms to 3000ms
  MAX_RETRIES: 2,
  RATE_LIMIT_PER_HOUR: 55, // Conservative limit (GitHub allows 60)
  RATE_LIMIT_WINDOW: 3600000, // 1 hour in milliseconds
  REQUEST_TIMEOUT: 10000, // Increased timeout
  STATS_STORAGE_KEY: "github_username_stats",
  API_CALLS_STORAGE_KEY: "github_api_calls",
};

// Extended professional suffix pool
const suffixes = [
  // Development focused
  "dev",
  "codes",
  "tech",
  "engineer",
  "labs",
  "hq",
  "system",
  "cloud",
  "data",
  "works",
  "studio",
  "official",
  "solutions",
  "builds",
  "opensource",
  "digital",
  "stack",
  "core",
  "hub",
  "forge",
  "pro",
  "master",
  "ninja",
  "guru",
  "wizard",

  // Modern tech terms
  "api",
  "sdk",
  "cli",
  "app",
  "web",
  "mobile",
  "ai",
  "ml",
  "blockchain",
  "crypto",
  "fintech",
  "saas",
  "paas",
  "devops",

  // Professional suffixes
  "consulting",
  "agency",
  "group",
  "team",
  "collective",
  "network",
  "innovation",
  "ventures",
  "startup",
  "enterprise",
  "corporate",

  // Numbers and variations
  "01",
  "02",
  "03",
  "2024",
  "2025",
  "x",
  "io",
  "js",
  "py",
];

// Global state management with improved API tracking
const state = {
  apiCallCount: 0,
  lastApiCall: 0,
  checkTimeout: null,
  isGenerating: false,
  isChecking: false,
  apiCalls: [], // Track API calls with timestamps
  stats: {
    totalChecks: 0,
    totalGenerated: 0,
    totalAvailable: 0,
    sessionsCount: 1,
    rateLimitHits: 0,
  },
};

// 🔧 Utility Functions

/**
 * Enhanced Fisher-Yates shuffle algorithm
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
 */
function validateUsername(username) {
  if (!username || typeof username !== "string") {
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

  // GitHub username rules
  const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

  if (!githubUsernameRegex.test(trimmed)) {
    if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
      return {
        valid: false,
        error: "Username cannot start or end with hyphen",
      };
    }
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and hyphens",
    };
  }

  if (trimmed.includes("--")) {
    return {
      valid: false,
      error: "Username cannot contain consecutive hyphens",
    };
  }

  return { valid: true };
}

/**
 * IMPROVED: Track and manage API calls with sliding window
 */
function trackApiCall() {
  const now = Date.now();
  state.apiCalls.push(now);

  // Clean old calls outside the rate limit window
  state.apiCalls = state.apiCalls.filter(
    (callTime) => now - callTime < CONFIG.RATE_LIMIT_WINDOW
  );

  // Save to localStorage
  try {
    localStorage.setItem(
      CONFIG.API_CALLS_STORAGE_KEY,
      JSON.stringify(state.apiCalls)
    );
  } catch (error) {
    console.warn("Could not save API call tracking:", error);
  }
}

/**
 * IMPROVED: Enhanced rate limiting check
 */
function isRateLimited() {
  const now = Date.now();

  // Clean old calls
  state.apiCalls = state.apiCalls.filter(
    (callTime) => now - callTime < CONFIG.RATE_LIMIT_WINDOW
  );

  // Check if we've exceeded the hourly limit
  if (state.apiCalls.length >= CONFIG.RATE_LIMIT_PER_HOUR) {
    return {
      limited: true,
      reason: "hourly_limit",
      remainingTime:
        CONFIG.RATE_LIMIT_WINDOW - (now - Math.min(...state.apiCalls)),
    };
  }

  // Check minimum time between calls
  const timeSinceLastCall = now - state.lastApiCall;
  const minInterval = 1000; // 1 second minimum between calls

  if (timeSinceLastCall < minInterval) {
    return {
      limited: true,
      reason: "too_frequent",
      remainingTime: minInterval - timeSinceLastCall,
    };
  }

  return { limited: false };
}

/**
 * Get remaining API calls for this hour
 */
function getRemainingApiCalls() {
  const now = Date.now();
  state.apiCalls = state.apiCalls.filter(
    (callTime) => now - callTime < CONFIG.RATE_LIMIT_WINDOW
  );
  return Math.max(0, CONFIG.RATE_LIMIT_PER_HOUR - state.apiCalls.length);
}

/**
 * Animate element entrance
 */
function animateIn(element, delay = 0) {
  setTimeout(() => {
    element.classList.add("show");
  }, delay);
}

/**
 * Create username result element
 */
function createUsernameElement(username, status = "checking") {
  const usernameDiv = document.createElement("div");
  usernameDiv.className = "username checking";

  const statusClass =
    status === "available"
      ? "available"
      : status === "taken"
      ? "taken"
      : status === "error"
      ? "error"
      : status === "rate_limited"
      ? "error"
      : "checking";

  const statusText =
    status === "available"
      ? "✅ Available"
      : status === "taken"
      ? "❌ Taken"
      : status === "error"
      ? "⚠️ Error"
      : status === "rate_limited"
      ? "⏰ Rate Limited"
      : "🔍 Checking...";

  usernameDiv.innerHTML = `
    <span class="username-text">${username}</span>
    <div class="username-actions">
      <span class="status ${statusClass}">${statusText}</span>
      ${
        status === "available"
          ? `<button class="copy-btn" onclick="copyToClipboard('${username}', this)" title="Copy username">📋</button>`
          : ""
      }
    </div>
  `;

  return usernameDiv;
}

/**
 * IMPROVED: Check username availability with better error handling
 */
async function checkUsernameAvailability(username) {
  // Check rate limiting first
  const rateLimitCheck = isRateLimited();
  if (rateLimitCheck.limited) {
    console.warn("Rate limited:", rateLimitCheck.reason);
    state.stats.rateLimitHits++;

    if (rateLimitCheck.reason === "hourly_limit") {
      showRateLimitWarning(rateLimitCheck.remainingTime);
      return "rate_limited";
    }

    // Wait for minimum interval
    await new Promise((resolve) =>
      setTimeout(resolve, rateLimitCheck.remainingTime)
    );
  }

  try {
    // Track this API call
    trackApiCall();
    state.lastApiCall = Date.now();
    state.apiCallCount++;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.REQUEST_TIMEOUT
    );

    const response = await fetch(CONFIG.GITHUB_API_BASE + username, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitHub-Username-Checker",
      },
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      return "available";
    } else if (response.status === 200) {
      return "taken";
    } else if (response.status === 403) {
      console.warn("GitHub API rate limit exceeded (403)");
      state.stats.rateLimitHits++;
      showRateLimitWarning();
      return "rate_limited";
    } else if (response.status === 429) {
      console.warn("GitHub API rate limit exceeded (429)");
      state.stats.rateLimitHits++;
      showRateLimitWarning();
      return "rate_limited";
    } else {
      console.warn("Unexpected API response:", response.status);
      return "error";
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Request timeout for username:", username);
      return "error";
    }
    console.error("API Error:", error);
    return "error";
  }
}

/**
 * NEW: Show rate limit warning to user
 */
function showRateLimitWarning(remainingTime = null) {
  const warningMsg = remainingTime
    ? `Rate limit reached. Please wait ${Math.ceil(
        remainingTime / 60000
      )} minutes before checking more usernames.`
    : "Rate limit reached. Please wait a few minutes before checking more usernames.";

  showError(warningMsg);

  // Update UI to show rate limit status
  const progressIndicator = document.getElementById("progressIndicator");
  if (progressIndicator) {
    progressIndicator.style.display = "block";
    progressIndicator.innerHTML = `
      <div style="color: #FFC107;">
        ⏰ Rate Limited - Remaining API calls: ${getRemainingApiCalls()}/${
      CONFIG.RATE_LIMIT_PER_HOUR
    }
        <br><small>Limits reset hourly. Try again in a few minutes.</small>
      </div>
    `;
  }
}

/**
 * Update username element status
 */
function updateUsernameStatus(element, status, username) {
  element.classList.remove("checking");

  const statusElement = element.querySelector(".status");
  const actionsContainer = element.querySelector(".username-actions");

  const statusClass =
    status === "available"
      ? "available"
      : status === "taken"
      ? "taken"
      : status === "rate_limited"
      ? "error"
      : "error";

  const statusText =
    status === "available"
      ? "✅ Available"
      : status === "taken"
      ? "❌ Taken"
      : status === "rate_limited"
      ? "⏰ Rate Limited"
      : "⚠️ Error";

  statusElement.className = `status ${statusClass}`;
  statusElement.textContent = statusText;

  // Add copy button for available usernames
  if (status === "available") {
    const existingBtn = actionsContainer.querySelector(".copy-btn");
    if (!existingBtn) {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.title = "Copy username";
      copyBtn.textContent = "📋";
      copyBtn.onclick = () => copyToClipboard(username, copyBtn);
      actionsContainer.appendChild(copyBtn);
    }

    state.stats.totalAvailable++;
    updateStatsDisplay();
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = "✅";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
    button.textContent = "❌";
    setTimeout(() => {
      button.textContent = "📋";
    }, 2000);
  }
}

/**
 * Generate username variations
 */
function generateUsernameVariations(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanName) return [];

  const variations = new Set();

  // Add base name
  variations.add(cleanName);

  // Add with suffixes (reduced to limit API calls)
  const shuffledSuffixes = shuffle(suffixes);
  shuffledSuffixes.slice(0, 8).forEach((suffix) => {
    // Reduced from 20 to 8
    variations.add(cleanName + suffix);
    if (Math.random() > 0.8) {
      // Reduced probability
      variations.add(cleanName + "-" + suffix);
    }
  });

  // Add with numbers (reduced)
  for (let i = 1; i <= 3; i++) {
    // Reduced from 5 to 3
    const num = Math.floor(Math.random() * 999) + 1;
    variations.add(cleanName + num);
    if (Math.random() > 0.8) {
      variations.add(cleanName + "-" + num);
    }
  }

  // Convert to array and filter
  const result = Array.from(variations)
    .filter((username) => {
      const validation = validateUsername(username);
      return validation.valid && username.length <= 39;
    })
    .slice(0, 8); // Reduced from 15 to 8 to be more conservative with API calls

  return shuffle(result);
}

/**
 * IMPROVED: Batch check usernames with better rate limiting
 */
async function batchCheckUsernames(usernames, resultsContainer) {
  const remainingCalls = getRemainingApiCalls();

  if (remainingCalls <= 0) {
    showRateLimitWarning();
    return;
  }

  // Limit usernames to check based on remaining API calls
  const usernamesToCheck = usernames.slice(
    0,
    Math.min(usernames.length, remainingCalls)
  );

  if (usernamesToCheck.length < usernames.length) {
    showError(
      `Rate limit approaching. Checking only ${usernamesToCheck.length} of ${usernames.length} usernames.`
    );
  }

  const batches = [];
  for (let i = 0; i < usernamesToCheck.length; i += CONFIG.BATCH_SIZE) {
    batches.push(usernamesToCheck.slice(i, i + CONFIG.BATCH_SIZE));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const progressIndicator = document.getElementById("progressIndicator");

    if (progressIndicator) {
      progressIndicator.style.display = "block";
      progressIndicator.innerHTML = `
        Checking batch ${i + 1} of ${batches.length}... (${Math.round(
        ((i + 1) / batches.length) * 100
      )}%)
        <br><small>API calls remaining: ${getRemainingApiCalls()}/${
        CONFIG.RATE_LIMIT_PER_HOUR
      }</small>
      `;
    }

    const promises = batch.map(async (username) => {
      const element = resultsContainer.querySelector(
        `[data-username="${username}"]`
      );
      if (element) {
        const status = await checkUsernameAvailability(username);
        updateUsernameStatus(element, status, username);
        state.stats.totalChecks++;

        // Stop checking if we hit rate limit
        if (status === "rate_limited") {
          return "stop";
        }
      }
    });

    const results = await Promise.allSettled(promises);

    // Check if we should stop due to rate limiting
    const shouldStop = results.some(
      (result) => result.status === "fulfilled" && result.value === "stop"
    );

    if (shouldStop) {
      break;
    }

    // Wait between batches
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, CONFIG.BATCH_DELAY));
    }
  }

  if (document.getElementById("progressIndicator")) {
    const remaining = getRemainingApiCalls();
    if (remaining <= 0) {
      showApiStatus();
    } else {
      document.getElementById("progressIndicator").style.display = "none";
    }
  }

  updateStatsDisplay();
  showStatsIfHidden();
}

/**
 * Main function to generate usernames
 */
async function generateUsernames() {
  const nameInput = document.getElementById("nameInput");
  const generateBtn = document.getElementById("generateBtn");
  const resultsContainer = document.getElementById("results");

  const name = nameInput.value.trim();

  if (!name) {
    showError("Please enter a name or keyword");
    nameInput.focus();
    return;
  }

  // Check if we have API calls remaining
  const remaining = getRemainingApiCalls();
  if (remaining <= 0) {
    showRateLimitWarning();
    return;
  }

  if (state.isGenerating) {
    return;
  }

  state.isGenerating = true;
  generateBtn.innerHTML = "";
  generateBtn.classList.add("loading");
  generateBtn.disabled = true;

  try {
    resultsContainer.innerHTML = "";

    const usernames = generateUsernameVariations(name);

    if (usernames.length === 0) {
      showError("Could not generate valid usernames from the provided input");
      return;
    }

    // Create username elements
    usernames.forEach((username, index) => {
      const usernameElement = createUsernameElement(username);
      usernameElement.setAttribute("data-username", username);
      resultsContainer.appendChild(usernameElement);
      animateIn(usernameElement, index * 100);
    });

    state.stats.totalGenerated += usernames.length;

    // Start batch checking
    await batchCheckUsernames(usernames, resultsContainer);
  } catch (error) {
    console.error("Generation error:", error);
    showError("An error occurred while generating usernames");
  } finally {
    state.isGenerating = false;
    generateBtn.classList.remove("loading");
    generateBtn.innerHTML = "Regenerate Ideas 🔄";
    generateBtn.disabled = false;
  }
}

/**
 * Check single username availability
 */
async function checkSingleUsername() {
  const input = document.getElementById("usernameCheckInput");
  const button = document.getElementById("checkUsernameBtn");
  const resultsContainer = document.getElementById("checkResults");

  const username = input.value.trim();

  if (!username) {
    showError("Please enter a username to check", resultsContainer);
    input.focus();
    return;
  }

  const validation = validateUsername(username);
  if (!validation.valid) {
    showError(validation.error, resultsContainer);
    input.classList.add("error");
    return;
  }

  // Check API calls remaining
  const remaining = getRemainingApiCalls();
  if (remaining <= 0) {
    showRateLimitWarning();
    return;
  }

  input.classList.remove("error");

  if (state.isChecking) {
    return;
  }

  state.isChecking = true;
  button.classList.add("loading");
  button.disabled = true;

  try {
    resultsContainer.innerHTML = "";

    const usernameElement = createUsernameElement(username);
    resultsContainer.appendChild(usernameElement);
    animateIn(usernameElement, 100);

    const status = await checkUsernameAvailability(username);
    updateUsernameStatus(usernameElement, status, username);

    state.stats.totalChecks++;
    if (status === "available") {
      state.stats.totalAvailable++;
    }

    updateStatsDisplay();
    showStatsIfHidden();
    showApiStatus();
  } catch (error) {
    console.error("Check error:", error);
    showError(
      "An error occurred while checking the username",
      resultsContainer
    );
  } finally {
    state.isChecking = false;
    button.classList.remove("loading");
    button.disabled = false;
  }
}

/**
 * Show error message
 */
function showError(message, container = null) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  if (container) {
    container.innerHTML = "";
    container.appendChild(errorDiv);
  } else {
    const checkResults = document.getElementById("checkResults");
    const results = document.getElementById("results");
    checkResults.innerHTML = "";
    checkResults.appendChild(errorDiv.cloneNode(true));
    results.innerHTML = "";
    results.appendChild(errorDiv);
  }

  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 8000); // Increased from 5s to 8s for rate limit messages
}

/**
 * IMPROVED: Update stats display with rate limit info
 */
function updateStatsDisplay() {
  const checksCount = document.getElementById("checksCount");
  const generatedCount = document.getElementById("generatedCount");
  const availableCount = document.getElementById("availableCount");
  const successRate = document.getElementById("successRate");

  if (checksCount) checksCount.textContent = state.stats.totalChecks;
  if (generatedCount) generatedCount.textContent = state.stats.totalGenerated;
  if (availableCount) availableCount.textContent = state.stats.totalAvailable;
  if (successRate) {
    const rate =
      state.stats.totalChecks > 0
        ? Math.round(
            (state.stats.totalAvailable / state.stats.totalChecks) * 100
          )
        : 0;
    successRate.textContent = rate + "%";
  }
}

/**
 * Show API status indicator
 */
function showApiStatus() {
  const remaining = getRemainingApiCalls();
  const progressIndicator = document.getElementById("progressIndicator");

  if (progressIndicator) {
    if (remaining <= 0) {
      progressIndicator.style.display = "block";
      progressIndicator.innerHTML = `
        <div style="color: #FF5252;">
          🚫 API Rate Limit Reached: 0/${CONFIG.RATE_LIMIT_PER_HOUR}
          <br><small>Wait for limits to reset (resets hourly)</small>
        </div>
      `;
    } else if (remaining < 10) {
      progressIndicator.style.display = "block";
      progressIndicator.innerHTML = `
        <div style="color: #FFC107;">
          ⚠️ API calls remaining: ${remaining}/${CONFIG.RATE_LIMIT_PER_HOUR}
          <br><small>Consider waiting before generating more usernames</small>
        </div>
      `;
    } else {
      progressIndicator.style.display = "block";
      progressIndicator.innerHTML = `
        <div style="color: #4CAF50;">
          ✅ API calls remaining: ${remaining}/${CONFIG.RATE_LIMIT_PER_HOUR}
          <br><small>Ready to check usernames</small>
        </div>
      `;
    }
  }
}

/**
 * Show stats card if hidden
 */
function showStatsIfHidden() {
  const statsCard = document.getElementById("statsCard");
  if (statsCard && statsCard.style.display === "none") {
    statsCard.style.display = "block";
    animateIn(statsCard, 200);
  }
}

/**
 * IMPROVED: Initialize application with API call tracking
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
    console.warn("Could not load saved stats:", error);
  }

  // Load saved API calls
  try {
    const savedCalls = localStorage.getItem(CONFIG.API_CALLS_STORAGE_KEY);
    if (savedCalls) {
      const parsed = JSON.parse(savedCalls);
      const now = Date.now();
      // Only keep calls from the last hour
      state.apiCalls = parsed.filter(
        (callTime) => now - callTime < CONFIG.RATE_LIMIT_WINDOW
      );
    }
  } catch (error) {
    console.warn("Could not load saved API calls:", error);
  }

  // Set up input event listeners
  const usernameInput = document.getElementById("usernameCheckInput");
  const nameInput = document.getElementById("nameInput");

  if (usernameInput) {
    usernameInput.addEventListener("input", (e) => {
      const validation = validateUsername(e.target.value);
      if (e.target.value.trim() && !validation.valid) {
        e.target.classList.add("error");
      } else {
        e.target.classList.remove("error");
      }
    });

    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkSingleUsername();
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        generateUsernames();
      }
    });
  }

  // Save data periodically
  setInterval(() => {
    try {
      localStorage.setItem(
        CONFIG.STATS_STORAGE_KEY,
        JSON.stringify(state.stats)
      );
      localStorage.setItem(
        CONFIG.API_CALLS_STORAGE_KEY,
        JSON.stringify(state.apiCalls)
      );
    } catch (error) {
      console.warn("Could not save data:", error);
    }
  }, 30000);

  // Show initial API status
  updateStatsDisplay();
  showApiStatus();

  console.log("GitHub Username Generator initialized successfully!");
  console.log(
    `API calls remaining: ${getRemainingApiCalls()}/${
      CONFIG.RATE_LIMIT_PER_HOUR
    }`
  );

  // 🌗 Theme Toggle Setup
  const themeToggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  // Page load par theme set karo
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggleBtn.textContent = savedTheme === "light" ? "🌙" : "☀️";
  } else {
    // Default dark mode
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggleBtn.textContent = "🌙";
  }

  // Button click par toggle
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggleBtn.textContent = newTheme === "light" ? "🌙" : "☀️";
  });
}

// Create debounced version of check function
const debouncedCheckUsername = debounce(
  checkSingleUsername,
  CONFIG.DEBOUNCE_DELAY
);

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
