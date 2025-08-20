// Professional suffix pool
const suffixes = [
  "dev", "codes", "tech", "engineer", "labs", "hq", "system",
  "cloud", "data", "works", "studio", "official", "solutions",
  "builds", "opensource", "digital", "stack", "core"
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

// Generate professional usernames with animation
function generateUsernames() {
  let name = document.getElementById("nameInput").value.trim().toLowerCase();
  name = name.replace(/\s+/g, ""); // 🚀 remove all spaces

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!name) {
    resultsDiv.innerHTML = "<p>Please enter a name.</p>";
    return;
  }

  // Shuffle suffixes and add a few number variations
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
        <button class="copy-btn" onclick="copyUsername('${username}')">📋 Copy</button>
      `;

      resultsDiv.appendChild(usernameDiv);

      // Trigger fade-in effect
      setTimeout(() => {
        usernameDiv.classList.add("show");
      }, 50);

    }, index * 400); // delay each item
  });
}

// Copy username
function copyUsername(username) {
  navigator.clipboard.writeText(username);
  alert(`Copied: ${username}`);
}
