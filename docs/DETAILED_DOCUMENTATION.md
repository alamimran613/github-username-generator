# 📘 Detailed Documentation -- GitHub Username Generator

## 1. Overview

This project is a web-based tool for **generating and checking GitHub
usernames**.\
It is designed for contributors to easily understand, extend, and
maintain the project.

------------------------------------------------------------------------

## 2. Project Architecture

    /project-root
      ├── index.html        # Structure and layout (UI panels, results, stats, footer)
      ├── style.css         # Styling, responsiveness, themes, accessibility
      └── script.js         # Core logic: generation, API calls, validation, UI updates

------------------------------------------------------------------------

## 3. Code Explanation

### A. index.html

-   **Main container**: Wraps everything in the UI\
-   **Dual panels**:
    -   `checker-panel` → Username availability checker\
    -   `generator-panel` → Username generator\
-   **Stats dashboard**: Displays real-time stats\
-   **Info cards**: Explains API rate limits and features\
-   **Footer**: Credits and links

------------------------------------------------------------------------

### B. style.css

-   **Variables (`:root`)** → Centralized theme (colors, shadows,
    spacing, transitions)\
-   **Panels** → Glassmorphism styling, hover effects\
-   **Results Area** → Animated username cards with statuses
    (`available`, `taken`, `error`)\
-   **Animations** → Shimmer, pulse, fadeIn, loading spinner\
-   **Responsive design** → Breakpoints for 768px and 480px\
-   **Accessibility** → Reduced motion, high contrast mode

------------------------------------------------------------------------

### C. script.js

#### 📂 Structure

1.  **Configuration (`CONFIG`)** → API base URL, debounce delay, batch
    size, rate limit\
2.  **Suffix Pool** → Array of professional suffixes for username
    suggestions\
3.  **Global State (`state`)** → Tracks API calls, stats, flags for
    generating/checking\
4.  **Utility Functions** → Helpers (shuffle, debounce, validation,
    etc.)\
5.  **API Management** → Rate limit tracking, API call handling\
6.  **UI Functions** → DOM manipulation, animations, error handling\
7.  **Core Logic** → Username generation, batch checking, single checks\
8.  **Initialization** → Event listeners, localStorage persistence

------------------------------------------------------------------------

#### 🛠 Utility Functions

-   `shuffle(array)` → Randomizes suffixes for username variation\
-   `debounce(func, wait)` → Prevents repeated API calls on typing\
-   `validateUsername(username)` → Enforces GitHub username rules

------------------------------------------------------------------------

#### 🌐 API Functions

-   `trackApiCall()` → Stores timestamps of API calls (localStorage)\
-   `isRateLimited()` → Checks if API limit exceeded (55/hour) or too
    frequent\
-   `getRemainingApiCalls()` → Returns available calls left this hour\
-   `checkUsernameAvailability(username)` →
    -   Calls GitHub API (`https://api.github.com/users/{username}`)\
    -   Returns status:
        `"available" | "taken" | "error" | "rate_limited"`

------------------------------------------------------------------------

#### ✨ Username Generation

-   `generateUsernameVariations(name)` →
    -   Cleans input (`myName` → `myname`)\
    -   Adds suffixes (e.g., `myname-dev`, `myname-ai`)\
    -   Adds numeric variations (`myname123`)\
    -   Returns up to 8 valid variations
-   `generateUsernames()` →
    -   Clears results\
    -   Creates username cards (UI)\
    -   Batch checks availability

------------------------------------------------------------------------

#### 🔎 Username Checking

-   `checkSingleUsername()` → Checks a single username from input\
-   `batchCheckUsernames(usernames, resultsContainer)` →
    -   Splits into batches (`BATCH_SIZE = 2`)\
    -   Waits between requests (`BATCH_DELAY = 3000ms`)\
    -   Stops when rate limited

------------------------------------------------------------------------

#### 🎨 UI Functions

-   `createUsernameElement(username, status)` → Creates a result card\
-   `updateUsernameStatus(element, status, username)` → Updates card
    with status\
-   `copyToClipboard(text, button)` → Copies username with ✅/❌
    feedback\
-   `showError(message)` → Displays styled error message\
-   `updateStatsDisplay()` → Updates dashboard counts (checks,
    generated, available, success rate)\
-   `showStatsIfHidden()` → Displays stats dashboard after first
    check/generation\
-   `showApiStatus()` → Shows remaining API calls

------------------------------------------------------------------------

#### 🚀 Initialization

-   `initializeApp()` →
    -   Loads saved stats & API calls from localStorage\
    -   Adds input event listeners\
    -   Saves state periodically\
    -   Shows initial API status

------------------------------------------------------------------------

## 4. Extending the Project

-   **Add new suffixes** → Modify `const suffixes = [ ... ]` in
    `script.js`\
-   **Change theme** → Update CSS variables in `:root` in `style.css`\
-   **Improve generator** → Edit `generateUsernameVariations()`\
-   **Add new features** →
    -   Integrate OAuth for higher API limits\
    -   Add filters (e.g., "only show available usernames")\
    -   Add export feature (CSV / copy all)

------------------------------------------------------------------------

## 5. Contribution Guide

-   Follow the **existing code style** (ES6+, clear naming)\
-   Document new functions (parameters, return values, errors)\
-   Add comments where logic is complex (e.g., rate limiting)\
-   Test on both desktop & mobile before PR

------------------------------------------------------------------------


## 6. References  

- [GitHub REST API Docs](https://docs.github.com/en/rest)  
- [GitHub Username Policy (official)](https://docs.github.com/en/site-policy/other-site-policies/github-username-policy)  
- [Username rules (allowed characters & length)](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/iam-configuration-reference/username-considerations-for-external-authentication)  
