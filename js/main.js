import { isLoggedIn, logOut, signIn } from "./auth.js";
import { loadProfile, renderProfile } from "./profile.js";

const loginView = document.querySelector("#login-view");
const profileView = document.querySelector("#profile-view");
const loginForm = document.querySelector("#login-form");
const loginButton = document.querySelector("#login-button");
const loginError = document.querySelector("#login-error");
const logoutButton = document.querySelector("#logout-button");
const profileStatus = document.querySelector("#profile-status");

function showLogin(message = "") {
  loginView.hidden = false;
  profileView.hidden = true;
  loginError.textContent = message;
  loginError.hidden = !message;
}

function showProfile() {
  loginView.hidden = true;
  profileView.hidden = false;
  loginError.hidden = true;
}

async function openProfile() {
  showProfile();
  profileStatus.textContent = "Loading your profile…";

  try {
    const profile = await loadProfile();
    renderProfile(profile);
    profileStatus.textContent = "";
  } catch (error) {
    logOut();
    showLogin(error.message || "Your session expired. Please sign in again.");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";

  const formData = new FormData(loginForm);
  const identifier = formData.get("identifier").trim();
  const password = formData.get("password");

  try {
    await signIn(identifier, password);
    loginForm.reset();
    await openProfile();
  } catch (error) {
    showLogin(error.message || "Could not sign in. Please try again.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign in";
  }
});

logoutButton.addEventListener("click", () => {
  logOut();
  showLogin();
  document.querySelector("#identifier").focus();
});

if (isLoggedIn()) {
  openProfile();
} else {
  showLogin();
}
