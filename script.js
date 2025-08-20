// Professional suffix pool for generator
const suffixes = [

  "dev", "codes", "coder", "engineer", "programmer", "developer",
  "stack", "tech", "sys", "ops", "devops", "pro", "guru", "ninja",
  "builds", "studio", "core", "forge", "hub", "script", "backend",
  "api", "cli", "sdk", "db", "data", "ai", "ml", "infra", "server",
  "cloud", "web"

];

// Shuffle helper
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }
  return array;
}

// Copy to clipboard helper
function copyUsername(username, button) {
  navigator.clipboard.writeText(username).then(() => {
    button.textContent = "✅ Copied";
    setTimeout(() => {
      button.textContent = "📋 Copy";
    }, 1500);
  });
}

// 🌟 Top Section: Check GitHub Username Availability
async function checkGitHubUsername() {
  const input = document.getElementById("usernameCheckInput");
  let username = input.value.trim().toLowerCase().replace(/\s+/g, "");
  const resultDiv = document.getElementById("checkResults");
  resultDiv.innerHTML = "";

  if (!username) {
    resultDiv.innerHTML = "<p>Please enter a username.</p>";
    return;
  }

  // Show checking animation
  const loadingMsg = document.createElement("p");
  loadingMsg.textContent = "Checking...";
  loadingMsg.style.opacity = 0;
  resultDiv.appendChild(loadingMsg);
  setTimeout(() => loadingMsg.style.opacity = 1, 50);

  // Call GitHub API
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    resultDiv.innerHTML = "";

    const usernameDiv = document.createElement("div");
    usernameDiv.classList.add("username", "show");

    let available;
    let message;
    if (response.status === 404) {
      available = true;
      message = `✅ Username available! You can create it.`;
    } else {
      available = false;
      message = `❌ Username taken! Try generating unique usernames below.`;
    }

    usernameDiv.innerHTML = `
      <span>${username}</span>
      <span class="status ${available ? "available" : "taken"}">${message}</span>
      <button class="copy-btn" onclick="copyUsername('${username}', this)">📋 Copy</button>
    `;
    resultDiv.appendChild(usernameDiv);

  } catch (err) {
    resultDiv.innerHTML = `<p>Error checking username. Try again.</p>`;
    console.error(err);
  }
}

// 🌟 Bottom Section: Generate Professional Usernames
function generateUsernames() {
  let name = document.getElementById("nameInput").value.trim().toLowerCase();
  name = name.replace(/\s+/g, ""); // remove all spaces

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!name) {
    resultsDiv.innerHTML = "<p>Please enter a name.</p>";
    return;
  }

  let shuffled = shuffle([...suffixes]);
  let generated = [];

  for (let i = 0; i < 8; i++) {
    let suffix = shuffled[i % shuffled.length];
    let addNumber = Math.random() > 0.6 ? Math.floor(Math.random() * 90 + 10) : "";
    generated.push(`${name}${suffix}${addNumber}`);
  }

  // Animate adding usernames one by one
  generated.forEach((username, index) => {
    setTimeout(() => {
      const usernameDiv = document.createElement("div");
      usernameDiv.classList.add("username");

      // Simulate availability
      const available = Math.random() > 0.5;

      usernameDiv.innerHTML = `
        <span>${username}</span>
        <span class="status ${available ? 'available' : 'taken'}">
          ${available ? '✅ Available' : '❌ Taken'}
        </span>
        <button class="copy-btn" onclick="copyUsername('${username}', this)">📋 Copy</button>
      `;

      resultsDiv.appendChild(usernameDiv);

      // Trigger fade-in effect
      setTimeout(() => {
        usernameDiv.classList.add("show");
      }, 50);

    }, index * 400);
  });
}
