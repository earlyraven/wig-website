// Event listeners for the buttons.
document.getElementById("turnOnButton").addEventListener("click", turnOn);
document.getElementById("turnOffButton").addEventListener("click", turnOff);
document.getElementById("lightImage").addEventListener("click", toggleImage);

// Light status variable.
var lightState = "off";

// Turn the light on.
function turnOn() {
  lightState = "on";
  setLight();
}

// Turn the light off.
function turnOff() {
  lightState = "off";
  setLight();
}

// Toggle the light.
function toggleImage() {
  if (lightState == "on") {
    turnOff();
  }
  else {
    turnOn();
  }
}

// Set the light to what it should be (based on the status).
function setLight() {
  document.getElementById("lightImage").src = "single_light_" + lightState + ".svg";
}

