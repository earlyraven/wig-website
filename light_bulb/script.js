// Event listeners for the buttons.
document.getElementById("turnOnButton").addEventListener("click", turnOn);
document.getElementById("turnOffButton").addEventListener("click", turnOff);

// Turn the light on.
function turnOn() {
//  document.getElementById('lightImage').src = 'light_on.png';
  document.getElementById('lightImage').src = 'single_light_on.svg';
}

// Turn the light off.
function turnOff() {
  document.getElementById('lightImage').src = 'single_light_off.svg';
}