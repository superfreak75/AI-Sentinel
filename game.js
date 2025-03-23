// Score en level globaal beschikbaar maken meteen bij het laden van het script
window.score = 0;
window.level = 1;

let player;
let enemies = [];
let projectiles = [];
let stars = [];
let gameState = "terminal";
let score = 0;
let lives = 3;
let backgroundParticles = [];
let neuralConnections = [];
let level = 1;
let enemyProjectiles = [];
let explosionParticles = [];
let powerups = []; // Array om powerups bij te houden
let powerupSpawnTime = 10000; // Tijd tussen powerup spawns (10 seconden)
let lastPowerupTime = 0; // Laatste tijd dat een powerup werd gegenereerd
// Leaderboard variabelen
let leaderboardData = [];
let playerEmail = "";
let showLeaderboard = false;
let supabaseLoading = false;

// Supabase configuratie
// WAARSCHUWING: Sla deze gegevens NIET op in je code voor productie
// Gebruik een .env bestand of configuratie-service voor productie
let SUPABASE_URL = ''; 
let SUPABASE_KEY = '';
let supabase;

// Initialiseer Supabase client veilig
try {
  // Probeer de configuratie uit het window.appConfig object te halen (van config.js)
  if (window.appConfig && window.appConfig.supabase) {
    SUPABASE_URL = window.appConfig.supabase.url;
    SUPABASE_KEY = window.appConfig.supabase.key;
    console.log('Supabase configuratie geladen uit config bestand');
  }
  
  // Alleen initialiseren als we de URL en KEY hebben
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client geïnitialiseerd');
  } else {
    console.log('Supabase configuratie ontbreekt - leaderboard functionaliteit uitgeschakeld');
    supabase = null;
  }
} catch (error) {
  console.error('Supabase initialisatie mislukt:', error);
  supabase = null;
}

// Terminal-specifieke variabelen
let terminalLines = [];
let terminalCursor = true;
let terminalCursorBlink = 0;
let terminalComplete = false;
let bootProgress = 0;
let bootingText = '';
let asciiLogo = [
"         ▄▄▄      ██▓   ▄▄▄█████▓▓█████  ███▄    █ ▄▄▄█████▓ ██▓ ███▄    █▓█████  ██▓    ",
"        ▒████▄   ▓██▒   ▓  ██▒ ▓▒▓█   ▀  ██ ▀█   █ ▓  ██▒ ▓▒▓██▒ ██ ▀█   █▓█   ▀ ▓██▒    ",
"        ▒██  ▀█▄ ▒██░   ▒ ▓██░ ▒░▒███   ▓██  ▀█ ██▒▒ ▓██░ ▒░▒██▒▓██  ▀█ ██▒███   ▒██░    ",
"        ░██▄▄▄▄██▒██░   ░ ▓██▓ ░ ▒▓█  ▄ ▓██▒  ▐▌██▒░ ▓██▓ ░ ░██░▓██▒  ▐▌██▒▓█  ▄ ▒██░    ",
"         ▓█   ▓██░██████  ▒██▒ ░ ░▒████▒▒██░   ▓██░  ▒██▒ ░ ░██░▒██░   ▓██░▒████▒░██████ ",
"         ▒▒   ▓▒█░ ▒░▓  ░ ▒ ░░   ░░ ▒░ ░░ ▒░   ▒ ▒   ▒ ░░   ░▓  ░ ▒░   ▒ ▒ ░░ ▒░ ░░ ▒░▓  ░",
"          ▒   ▒▒ ░ ░ ▒  ░   ░     ░ ░  ░░ ░░   ░ ▒░    ░     ▒ ░░ ░░   ░ ▒░ ░ ░  ░░ ░ ▒  ░",
"          ░   ▒    ░ ░    ░         ░      ░   ░ ░   ░       ▒ ░   ░   ░ ░    ░     ░ ░   ",
"              ░  ░   ░  ░           ░  ░         ░           ░           ░    ░  ░    ░  ░",
"                                                                                          ",
"                    ███▄    █ ▓█████  █    ██  ██▀███   ▄▄▄       ██▓                     ",
"                    ██ ▀█   █ ▓█   ▀  ██  ▓██▒▓██ ▒ ██▒▒████▄    ▓██▒                     ",
"                   ▓██  ▀█ ██▒▒███   ▓██  ▒██░▓██ ░▄█ ▒▒██  ▀█▄  ▒██░                     ",
"                   ▓██▒  ▐▌██▒▒▓█  ▄ ▓▓█  ░██░▒██▀▀█▄  ░██▄▄▄▄██ ▒██░                     ",
"                   ▒██░   ▓██░░▒████▒▒▒█████▓ ░██▓ ▒██▒ ▓█   ▓██▒░██████▒                 ",
"                   ░ ▒░   ▒ ▒ ░░ ▒░ ░░▒▓▒ ▒ ▒ ░ ▒▓ ░▒▓░ ▒▒   ▓▒█░░ ▒░▓  ░                 ",
"                   ░ ░░   ░ ▒░ ░ ░  ░░░▒░ ░ ░   ░▒ ░ ▒░  ▒   ▒▒ ░░ ░ ▒  ░                 ",
"                      ░   ░ ░    ░    ░░░ ░ ░   ░░   ░   ░   ▒     ░ ░                    ",
"                            ░    ░  ░   ░        ░           ░  ░    ░  ░                 "
];

let initSequences = [
  { text: "", delay: 300 }, // Eerste regel is leeg voor na het logo
  { text: "> AI SENTINEL NEURAL DEFENSE SYSTEM v3.7", delay: 50 },
  { text: "> INITIALISEREN KWANTUMPROCESSOR...", delay: 40 },
  { text: "> NEURAL NETWERK KALIBREREN...", delay: 40 },
  { text: "> STAND BY FOR NEURAL UPLINK...", delay: 50 },
  { text: "> SENTINEL AI CORE ONLINE", delay: 70 },
  { text: "", delay: 100 },
  { text: "> WAARSCHUWING: VIJANDIGE AI ENTITEITEN GEDETECTEERD", delay: 60, color: "#ff3333" },
  { text: "> DRUK OP SPATIE OM HET VERDEDIGINGSSYSTEEM TE ACTIVEREN", delay: 50, color: "#00ffff", blink: true }
];
let currentLine = 0;
let charIndex = 0;
let nextCharTime = 0;
let launchButtonActive = false;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('game-canvas');
  
  // Maak score globaal beschikbaar voor de deelfunctie
  window.score = score;
  window.level = level;
  console.log("Initial setup - Score:", score, "Level:", level, "Window score:", window.score, "Window level:", window.level);
  
  // Zorg ervoor dat de UI correct wordt weergegeven
  updateUIDisplay();
  
  player = new Player(width / 2, height - 50);
  
  // Meer sterren voor een mooier ruimte-effect
  for (let i = 0; i < 100; i++) {
    stars.push(new Star(random(width), random(height), random(1, 3)));
  }
  
  // Voeg achtergronddeeltjes toe
  for (let i = 0; i < 30; i++) {
    backgroundParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.2, 0.5),
      hue: random(170, 220)
    });
  }
  
  // Creëer neurale verbindingen als achtergrond
  for (let i = 0; i < 15; i++) {
    let connection = {
      x1: random(width),
      y1: random(height),
      x2: random(width),
      y2: random(height),
      alpha: random(20, 80),
      pulseSpeed: random(0.01, 0.03),
      pulsePhase: random(TWO_PI)
    };
    neuralConnections.push(connection);
  }
  
  // Terminal initialiseren
  textFont('Courier New');
  nextCharTime = millis();
  
  // Laatste powerup tijd initialiseren
  lastPowerupTime = millis();
  
  // Spawn enemies alleen als we niet in terminal mode zijn
  if (gameState !== "terminal") {
    spawnEnemies();
  }
}

function draw() {
  // Donkerblauwe achtergrond in plaats van zwart
  background(5, 10, 30);
  
  // Teken neurale verbindingen
  for (let connection of neuralConnections) {
    connection.pulsePhase += connection.pulseSpeed;
    let alpha = map(sin(connection.pulsePhase), -1, 1, 10, connection.alpha);
    
    stroke(0, 150, 255, alpha);
    strokeWeight(1);
    line(connection.x1, connection.y1, connection.x2, connection.y2);
    
    // Kleine nodes aan de uiteinden
    noStroke();
    fill(0, 150, 255, alpha + 20);
    ellipse(connection.x1, connection.y1, 3, 3);
    ellipse(connection.x2, connection.y2, 3, 3);
  }
  
  // Teken achtergronddeeltjes
  for (let particle of backgroundParticles) {
    colorMode(HSB);
    noStroke();
    fill(particle.hue, 150, 255, 100);
    ellipse(particle.x, particle.y, particle.size);
    
    // Beweeg deeltjes naar beneden
    particle.y += particle.speed;
    
    // Reset als ze uit beeld gaan
    if (particle.y > height) {
      particle.y = 0;
      particle.x = random(width);
    }
    colorMode(RGB);
  }

  // Update en teken sterren in alle game states
    for (let star of stars) {
      star.update();
      star.show();
    }

  if (gameState === "terminal") {
    drawTerminal();
  } else if (gameState === "playing") {
    // Update en teken speler
    player.update();
    player.show();

    // Update en teken vijanden
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].show();
      if (enemies[i].offscreen()) {
        enemies.splice(i, 1);
      }
    }

    // Update en teken projectielen
    for (let i = projectiles.length - 1; i >= 0; i--) {
      projectiles[i].update();
      projectiles[i].show();
      if (projectiles[i].offscreen()) {
        projectiles.splice(i, 1);
      }
    }
    
    // Update en teken powerups
    updatePowerups();
    
    // Update en teken extra game elementen (vijandelijke projectielen, explosies, etc.)
    updateGameElements();

    // Botsingsdetectie
    checkCollisions();
    
    // Controleer of we nieuwe powerups moeten genereren
    checkPowerupSpawn();

    // Update UI display
    updateUIDisplay();

    // Console logging om te debuggen
    if (frameCount % 60 === 0) { // Elke seconde loggen
      console.log("During gameplay - Score:", score, "Level:", level, "Window score:", window.score, "Window level:", window.level);
    }

    // Toon score, levens en level
    textAlign(LEFT, CENTER);
    textSize(20);
    fill(0, 200, 255);
    text(`Score: ${score}`, 20, 35);
    text(`AI Cores: ${lives}`, 20, 65);
    text(`Level: ${level}`, 20, 95);
    
    // Toon globale window variabelen in de hoek rechtsonder (voor debugging)
    textSize(12);
    fill(200, 200, 255);
    text(`window.score: ${window.score}`, width - 150, height - 30);
    text(`window.level: ${window.level}`, width - 150, height - 15);
    
    // Toon powerup timers als ze actief zijn
    textAlign(LEFT, CENTER);
    textSize(20);
    if (player.tripleFireActive) {
      let timeLeft = Math.ceil((player.tripleFireEndTime - millis()) / 1000);
      fill(255, 100, 255);
      text(`Triple Fire: ${timeLeft}s`, 20, 125);
    }
    
    if (player.rapidFireActive) {
      let timeLeft = Math.ceil((player.rapidFireEndTime - millis()) / 1000);
      fill(255, 200, 0);
      text(`Rapid Fire: ${timeLeft}s`, 20, 155);
    }
    
    // Check voor level-up
    checkLevelUp();

    if (lives <= 0) {
      gameState = "gameOver";
    }
  } else if (gameState === "gameOver") {
    // Zorg dat globale score en level bijgewerkt zijn
    window.score = score;
    window.level = level;
    
    // Extra update van de UI
    updateUIDisplay();
    
    // Explosies en andere effecten blijven updaten
    updateGameElements();
    
    textAlign(CENTER, CENTER);
    
    // Game over glow effect
    let glowAmount = map(sin(frameCount * 0.05), -1, 1, 0, 15);
    
    // Shadow layers voor gloed-effect
    for (let i = 5; i > 0; i--) {
      fill(0, 200, 255, 10);
      textSize(64 + i);
      text("Neural Network Down", width / 2, height / 2 - 50);
    }
    
    fill(0, 200, 255);
    textSize(64);
    text("Neural Network Down", width / 2, height / 2 - 50);
    
    // Score weergeven
    fill(255);
    textSize(24);
    text(`Final Score: ${score}`, width / 2, height / 2 + 10);
    text(`Level: ${level}`, width / 2, height / 2 + 50);
    
    // Debug info weergeven
    textSize(12);
    fill(200, 200, 255);
    text(`window.score: ${window.score}`, width / 2, height / 2 + 80);
    text(`window.level: ${window.level}`, width / 2, height / 2 + 95);
    
    // Instructies weergeven
    fill(0, 255, 255);
    textSize(18);
    
    if (showLeaderboard) {
      // Toon leaderboard
      drawLeaderboard();
    } else {
      // Toon e-mailformulier voor score indienen
      drawEmailForm();
    }
  }
}

function drawTerminal() {
  // Terminal achtergrond
  noStroke();
  fill(0, 0, 0, 180);
  rect(50, 50, width - 100, height - 100, 10);
  
  // Border met glow effect
  let borderPulse = map(sin(frameCount * 0.05), -1, 1, 100, 200);
  stroke(0, 200, 255, borderPulse);
  strokeWeight(2);
  noFill();
  rect(50, 50, width - 100, height - 100, 10);
  
  // Terminal header
  noStroke();
  fill(30, 30, 50);
  rect(50, 50, width - 100, 30, 10, 10, 0, 0);
  
  // Header tekst
  fill(0, 200, 255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(" SENTINEL NEURAL DEFENSE TERMINAL", 60, 65);
  
  // ASCII art logo tonen als de terminal net start
  if (terminalLines.length === 0) {
    textSize(8);
    fill(0, 200, 255);
    for (let i = 0; i < asciiLogo.length; i++) {
      text(asciiLogo[i], width / 2 - textWidth(asciiLogo[i]) / 2, 100 + i * 10);
    }
  }
  
  // Terminal inhoud
  fill(0, 255, 0);
  textSize(16);
  textAlign(LEFT);
  
  // Update terminal animatie
  updateTerminal();
  
  // Terminal lijnen weergeven
  let startY = (terminalLines.length === 0) ? 300 : 100; // Begin lager als het logo zichtbaar is
  
  for (let i = 0; i < terminalLines.length; i++) {
    // Kleur instellen op basis van regelspecificatie
    if (terminalLines[i].color) {
      fill(terminalLines[i].color);
    } else {
      fill(0, 255, 0);
    }
    
    // Tekst tonen
    text(terminalLines[i].text, 70, startY + i * 24);
    
    // Knipperende tekst effect
    if (terminalLines[i].blink && sin(frameCount * 0.1) > 0) {
      fill(0, 0, 0, 150);
      rect(69, startY + i * 24 - 16, textWidth(terminalLines[i].text), 20);
    }
  }
  
  // Cursor tekenen indien nodig
  if (terminalCursor && !terminalComplete) {
    terminalCursorBlink += 0.1;
    if (sin(terminalCursorBlink) > 0) {
      fill(0, 255, 0);
      let lastLineY = startY + (terminalLines.length - 1) * 24;
      let cursorX = 70 + textWidth(bootingText);
      rect(cursorX, lastLineY - 15, 10, 18);
    }
  }
  
  // Laad-balk tekenen als we bezig zijn met initialisatie
  if (currentLine < initSequences.length - 2 && currentLine > 0) {
    // Progress bijwerken
    bootProgress = map(currentLine, 0, initSequences.length - 4, 0, 1);
    
    // Balk achtergrond
    noStroke();
    fill(20, 20, 40);
    rect(width / 2 - 150, height - 120, 300, 30, 5);
    
    // Balk voortgang
    fill(0, 200, 255);
    rect(width / 2 - 150, height - 120, 300 * bootProgress, 30, 5);
    
    // Voortgangspercentage
    fill(255);
    textAlign(CENTER, CENTER);
    text(`SYSTEEM INITIALISATIE: ${floor(bootProgress * 100)}%`, width / 2, height - 105);
    textAlign(LEFT);
  }
  
  // Activatie knop tekenen als we klaar zijn met de intro
  if (terminalComplete) {
    drawActivationButton();
  }
}

function updateTerminal() {
  // Als we klaar zijn met alle initialisaties
  if (currentLine >= initSequences.length) {
    terminalComplete = true;
    return;
  }
  
  // Als we nog niet bezig zijn met de huidige regel, begin ermee
  if (terminalLines.length <= currentLine) {
    terminalLines.push({
      text: "", 
      color: initSequences[currentLine].color,
      blink: initSequences[currentLine].blink
    });
    charIndex = 0;
    bootingText = "";
  }
  
  // Voeg karakters toe met vertraging
  if (millis() > nextCharTime) {
    // Voeg een karakter toe aan de huidige regel
    if (charIndex < initSequences[currentLine].text.length) {
      bootingText += initSequences[currentLine].text.charAt(charIndex);
      terminalLines[currentLine].text = bootingText;
      charIndex++;
      nextCharTime = millis() + (initSequences[currentLine].delay ? 
                                 random(10, initSequences[currentLine].delay / 10) : 
                                 random(10, 30));
    } 
    // Ga naar de volgende regel als deze compleet is
    else {
      currentLine++;
      bootingText = "";
      nextCharTime = millis() + 300; // Wacht wat langer tussen regels
    }
  }
}

function drawActivationButton() {
  // Controleer of de muis boven de knop is
  let buttonX = width / 2 - 125;
  let buttonY = height - 120;
  let buttonWidth = 250;
  let buttonHeight = 50;
  
  let mouseOverButton = (mouseX > buttonX && mouseX < buttonX + buttonWidth && 
                         mouseY > buttonY && mouseY < buttonY + buttonHeight);
  
  // Knop achtergrond
  noStroke();
  if (mouseOverButton) {
    fill(0, 150, 200);
    launchButtonActive = true;
  } else {
    fill(0, 100, 150);
    launchButtonActive = false;
  }
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
  
  // Knop glow
  let buttonGlow = map(sin(frameCount * 0.1), -1, 1, 0, 15);
  noFill();
  stroke(0, 200, 255, 150);
  strokeWeight(1 + buttonGlow/10);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
  
  // Knop tekst
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("ACTIVEER VERDEDIGINGSSYSTEEM", width / 2, buttonY + 25);
  textAlign(LEFT);
  
  // Lijnen aan de zijkant die knipperen
  stroke(0, 200, 255, 100 + buttonGlow * 10);
  strokeWeight(2);
  // Linker lijnen
  line(buttonX - 20, buttonY + 10, buttonX - 5, buttonY + 10);
  line(buttonX - 20, buttonY + buttonHeight - 10, buttonX - 5, buttonY + buttonHeight - 10);
  // Rechter lijnen
  line(buttonX + buttonWidth + 5, buttonY + 10, buttonX + buttonWidth + 20, buttonY + 10);
  line(buttonX + buttonWidth + 5, buttonY + buttonHeight - 10, buttonX + buttonWidth + 20, buttonY + buttonHeight - 10);
}

function mousePressed() {
  console.log("Mouse pressed at X:", mouseX, "Y:", mouseY, "Game state:", gameState, "Leaderboard visible:", showLeaderboard);
  
  if (gameState === "terminal" && launchButtonActive && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height - 100 && mouseY < height - 40) {
    startGame();
  } else if (gameState === "playing") {
    player.shoot();
  } else if (gameState === "gameOver") {
    // Check "Opnieuw spelen" knop op e-mailformulier
    if (!showLeaderboard && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && 
        mouseY > height / 2 + 205 && mouseY < height / 2 + 235) {
      console.log("Email form: Restart button clicked");
      resetGame();
    }
    
    // Check "Opnieuw spelen" knop op leaderboard
    const leaderboardButtonY = height / 2 + 250; // Y-positie van de knop op het leaderboard
    if (showLeaderboard && 
        mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && 
        mouseY > leaderboardButtonY - 15 && mouseY < leaderboardButtonY + 15) {
      console.log("Leaderboard: Restart button clicked");
      resetGame();
    }
    
    // Check of op de Submit knop is geklikt als het e-mailformulier wordt getoond
    if (!showLeaderboard) {
      // Submit knop check
      if (mouseX > width / 2 - 75 && mouseX < width / 2 + 75 && 
          mouseY > height / 2 + 160 && mouseY < height / 2 + 200) {
        submitScore();
      }
    }
  }
}

function startGame() {
  gameState = "playing";
  // Reset alle spelgegevens
  resetGame();
  
  // Update UI display na reset
  updateUIDisplay();
  
  console.log("Game started with score:", score, "level:", level, "window.score:", window.score, "window.level:", window.level);
}

function keyPressed() {
  if (keyCode === 32) { // spatiebalk
    if (gameState === "terminal" && terminalComplete) {
      startGame();
    } else if (gameState === "playing") {
      player.shoot();
    }
  }
  
  // Bewegingstoetsen voor speler
  if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
    player.setDirection(-1);
  }
  if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
    player.setDirection(1);
  }
  if (keyCode === UP_ARROW || key === 'w' || key === 'W') {
    player.setVerticalDirection(-1);
  }
  if (keyCode === DOWN_ARROW || key === 's' || key === 'S') {
    player.setVerticalDirection(1);
  }
  
  // E-mail input verwerken op game over scherm
  if (gameState === "gameOver" && !showLeaderboard) {
    console.log("Toets ingedrukt:", key, "KeyCode:", keyCode);
    
    // Verwerk alleen toetsaanslagen voor e-mailformulier als de leaderboard niet wordt getoond
    if (keyCode === BACKSPACE) {
      playerEmail = playerEmail.slice(0, -1);
    } else if (keyCode === ENTER) {
      submitScore();
    } else if (key === '.') {
      // Specifieke afhandeling voor de punt
      playerEmail += '.';
    } else if (key === '@') {
      // Specifieke afhandeling voor @
      playerEmail += '@';  
    } else if (key.length === 1 && playerEmail.length < 30) {
      // Controleer of het een geldig e-mailkarakter is
      const validEmailChars = /[a-zA-Z0-9._\-@]/;
      if (validEmailChars.test(key)) {
        playerEmail += key;
      }
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.setDirection(0);
  }
  if (keyCode === UP_ARROW) {
    player.setVerticalDirection(0);
  }
}

function keyIsDown(code) {
  return keyIsPressed && keyCode === code;
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.direction = 0;
    this.verticalDirection = 0;
    this.baseY = height - 50; // Standaardpositie onderaan
    this.speed = 5;
    this.verticalSpeed = 4;
    this.engineGlow = 0;
    this.forwardThrust = 0;
    this.thrusters = [];
    for (let i = 0; i < 5; i++) {
      this.thrusters.push({
        x: random(-8, 8),
        y: random(10, 15),
        life: random(10, 20)
      });
    }
    
    // Powerup eigenschappen
    this.tripleFireActive = false;
    this.tripleFireEndTime = 0;
    this.rapidFireActive = false;
    this.rapidFireEndTime = 0;
    this.lastFireTime = 0;
    this.fireRate = 350; // Normale vuursnelheid (ms)
    this.rapidFireRate = 150; // Snelle vuursnelheid (ms)
  }

  update() {
    // Horizontale beweging
    if (keyIsDown(LEFT_ARROW)) {
      this.setDirection(-1);
    } else if (keyIsDown(RIGHT_ARROW)) {
      this.setDirection(1);
    }
    
    // Verticale beweging
    if (keyIsDown(UP_ARROW)) {
      this.setVerticalDirection(-1);
      this.forwardThrust = 200;
    } else {
      // Terugkeren naar de basispositie als UP niet wordt ingedrukt
      if (this.y < this.baseY) {
        this.setVerticalDirection(1);
        this.forwardThrust = 100;
      } else if (this.y > this.baseY) {
        this.y = this.baseY;
        this.setVerticalDirection(0);
        this.forwardThrust = 0;
      } else {
        this.setVerticalDirection(0);
        this.forwardThrust = 0;
      }
    }
    
    // Begrens verticale beweging tot maximaal 1/4 scherm
    const minY = height - height / 4;
    if (this.y < minY && this.verticalDirection < 0) {
      this.y = minY;
      this.verticalDirection = 0;
    }
    
    this.x += this.speed * this.direction;
    this.y += this.verticalSpeed * this.verticalDirection;
    
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    
    // Motor-effect updaten
    this.engineGlow = (this.direction !== 0 || this.verticalDirection !== 0) ? 200 : 120;
    
    // Thrusters updaten
    for (let i = this.thrusters.length - 1; i >= 0; i--) {
      this.thrusters[i].y += 2;
      this.thrusters[i].life -= 1;
      
      if (this.thrusters[i].life <= 0) {
        this.thrusters[i] = {
          x: random(-8, 8),
          y: random(10, 15),
          life: random(10, 20)
        };
      }
    }
    
    // Check of powerups nog actief zijn
    if (this.tripleFireActive && millis() > this.tripleFireEndTime) {
      this.tripleFireActive = false;
    }
    
    if (this.rapidFireActive && millis() > this.rapidFireEndTime) {
      this.rapidFireActive = false;
    }
  }

  setDirection(dir) {
    this.direction = dir;
  }
  
  setVerticalDirection(dir) {
    this.verticalDirection = dir;
  }

  shoot() {
    // Controleer fire rate (voor rapid fire)
    const currentFireRate = this.rapidFireActive ? this.rapidFireRate : this.fireRate;
    if (millis() - this.lastFireTime < currentFireRate) return;
    
    this.lastFireTime = millis();
    
    // Standaard vuurmodus (één projectiel)
    if (!this.tripleFireActive) {
      projectiles.push(new Projectile(this.x, this.y - 25));
    } 
    // Triple fire modus
    else {
      // Centraal projectiel
      projectiles.push(new Projectile(this.x, this.y - 25));
      // Links projectiel (met kleine hoek)
      projectiles.push(new Projectile(this.x - 10, this.y - 20, -0.3));
      // Rechts projectiel (met kleine hoek)
      projectiles.push(new Projectile(this.x + 10, this.y - 20, 0.3));
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Thruster effect
    for (let thruster of this.thrusters) {
      if (this.direction !== 0 || this.verticalDirection !== 0) {
        noStroke();
        fill(0, 200, 255, thruster.life * 5);
        ellipse(thruster.x, thruster.y, 5, 10);
      }
    }
    
    // Forward thruster effect als UP wordt ingedrukt
    if (this.forwardThrust > 0) {
      noStroke();
      fill(0, 200, 255, this.forwardThrust);
      ellipse(0, 15, 20, 25);
    }
    
    // Schip gloed
    noStroke();
    fill(0, 100, 255, 100);
    ellipse(0, 0, this.width, this.height);
    
    // AI Neuro-schip
    // Hoofdromp
    fill(0, 50, 100);
    stroke(0, 200, 255);
    strokeWeight(2);
    beginShape();
    vertex(0, -20);  // Top
    vertex(15, 0);   // Rechts
    vertex(10, 10);  // Rechtsonder
    vertex(-10, 10); // Linksonder
    vertex(-15, 0);  // Links
    endShape(CLOSE);
    
    // Cockpit/AI Core
    fill(200, 255, 255);
    noStroke();
    ellipse(0, -5, 12, 12);
    
    // Energieringen
    noFill();
    stroke(0, 200, 255, this.engineGlow);
    strokeWeight(1.5);
    ellipse(0, -5, 16, 16);
    
    // Vleugels
    fill(0, 70, 120);
    stroke(0, 200, 255);
    strokeWeight(1.5);
    // Linkervleugel
    beginShape();
    vertex(-15, 0);
    vertex(-25, -10);
    vertex(-20, 10);
    endShape(CLOSE);
    // Rechtervleugel
    beginShape();
    vertex(15, 0);
    vertex(25, -10);
    vertex(20, 10);
    endShape(CLOSE);
    
    // Motor gloed
    noStroke();
    fill(0, 200, 255, this.engineGlow);
    arc(0, 10, 20, 10, 0, PI);
    
    pop();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = random(1, 3);
    this.rotation = 0;
    this.rotationSpeed = random(-0.03, 0.03);
    this.type = floor(random(3)); // 3 verschillende vijandtypes
    this.pulsePhase = random(TWO_PI);
    this.pulseSpeed = random(0.05, 0.1);
    this.canShoot = false;
    this.shootInterval = 0;
    this.lastShot = 0;
    this.isHoming = false;
    this.homingStrength = 0;
    this.hasShield = false;
    this.shieldStrength = 0;
  }

  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += this.pulseSpeed;
  }

  offscreen() {
    return this.y > height + this.height;
  }
  
  shoot() {
    // Voeg een vijandelijk projectiel toe
    let projectile = new EnemyProjectile(this.x, this.y + 20);
    enemyProjectiles.push(projectile);
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Gloed-effect
    let pulseSize = sin(this.pulsePhase) * 5;
    let glowAlpha = map(sin(this.pulsePhase), -1, 1, 100, 200);
    noStroke();
    fill(30, 120, 255, glowAlpha);
    ellipse(0, 0, this.width + pulseSize, this.height + pulseSize);
    
    // Schild tonen indien aanwezig
    if (this.hasShield && this.shieldStrength > 0) {
      noFill();
      strokeWeight(3);
      stroke(0, 255, 200, 150 + sin(this.pulsePhase) * 50);
      ellipse(0, 0, this.width + 15, this.height + 15);
    }
    
    // Verschillende vijandtypes gebaseerd op AI-thema
    switch (this.type) {
      case 0: // Neural Network Node
        stroke(0, 200, 255);
        strokeWeight(2);
        fill(20, 20, 50);
        ellipse(0, 0, this.width - 10, this.height - 10);
        
        // Verbindingen
        for (let i = 0; i < 4; i++) {
          let angle = i * PI / 2;
          line(0, 0, cos(angle) * this.width / 2, sin(angle) * this.height / 2);
          fill(0, 255, 255);
          noStroke();
          ellipse(cos(angle) * this.width / 2.5, sin(angle) * this.height / 2.5, 5, 5);
        }
        break;
        
      case 1: // Quantum Computer Schip
        stroke(200, 50, 200);
        strokeWeight(2);
        fill(40, 0, 60);
        
        // Quantum Core
        beginShape();
        for (let i = 0; i < 6; i++) {
          let angle = i * TWO_PI / 6;
          let r = this.width / 2 - 5;
          vertex(cos(angle) * r, sin(angle) * r);
        }
        endShape(CLOSE);
        
        // Quantum Golven
        noFill();
        stroke(255, 50, 255, 150);
        for (let i = 0; i < 2; i++) {
          ellipse(0, 0, this.width - 15 + i * 10, this.height - 15 + i * 10);
        }
        break;
        
      case 2: // Robotisch Gezicht
        // Hoofd
        fill(100, 100, 100);
        stroke(200, 200, 200);
        strokeWeight(2);
        rect(-this.width/2 + 5, -this.height/2 + 5, this.width - 10, this.height - 10, 5);
        
        // Ogen
        fill(255, 0, 0);
        noStroke();
        rect(-this.width/4 - 3, -this.height/5, 6, 6);
        rect(this.width/4 - 3, -this.height/5, 6, 6);
        
        // Mond
        noFill();
        stroke(255, 0, 0);
        beginShape();
        vertex(-this.width/4, this.height/5);
        vertex(-this.width/8, this.height/8);
        vertex(0, this.height/5);
        vertex(this.width/8, this.height/8);
        vertex(this.width/4, this.height/5);
        endShape();
        
        // Antenne
        line(0, -this.height/2 + 5, 0, -this.height/2 - 8);
        fill(255, 0, 0);
        ellipse(0, -this.height/2 - 8, 4, 4);
        break;
    }
    
    // Toon indicatoren voor speciale eigenschappen
    if (this.canShoot) {
      fill(255, 0, 0, 150);
      noStroke();
      ellipse(0, this.height/2 + 5, 5, 5);
    }
    
    if (this.isHoming) {
      fill(255, 150, 0, 150);
      noStroke();
      ellipse(this.width/2 + 5, 0, 5, 5);
    }
    
    pop();
  }
}

class Projectile {
  constructor(x, y, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle; // Hoek voor triple shot
    this.width = 8;
    this.height = 20;
    this.speed = 9;
    this.xSpeed = sin(this.angle) * this.speed; // Horizontale snelheid (voor triple shot)
    this.particles = [];
    this.hue = random(160, 220); // Blauwe/cyaan tinten
    
    // Maak startdeeltjes
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: random(-3, 3),
        y: random(-5, 5),
        alpha: random(150, 255),
        size: random(2, 5)
      });
    }
  }

  update() {
    this.y -= this.speed * cos(this.angle); // Verticale beweging aangepast voor hoek
    this.x += this.xSpeed; // Horizontale beweging voor hoek
    
    // Update deeltjes
    for (let particle of this.particles) {
      particle.y += random(-1, 1);
      particle.x += random(-0.5, 0.5);
      particle.alpha -= 5;
      
      if (particle.alpha <= 0) {
        particle.alpha = random(150, 255);
        particle.x = random(-3, 3);
        particle.y = random(-5, 5);
      }
    }
  }

  offscreen() {
    return this.y < -this.height;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Teken stralingsgloed
    noStroke();
    fill(this.hue, 255, 255, 50);
    ellipse(0, 0, this.width * 2, this.height);
    
    // Teken deeltjes
    for (let particle of this.particles) {
      fill(this.hue, 255, 255, particle.alpha);
      ellipse(particle.x, particle.y, particle.size);
    }
    
    // Teken kernstraal
    colorMode(HSB);
    fill(this.hue, 255, 255);
    noStroke();
    ellipse(0, 0, 4, this.height);
    
    // Teken energiepuls
    stroke(this.hue, 255, 255);
    strokeWeight(2);
    line(0, -this.height/2, 0, this.height/2);
    
    colorMode(RGB);
    pop();
  }
}

class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = size / 2;
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}

function spawnEnemies() {
  // Aantal vijanden en snelheid gebaseerd op level
  const enemyCount = 3 + Math.min(level, 7); // Max 10 vijanden op hoogste levels
  
  for (let i = 0; i < enemyCount; i++) {
    let x = random(50, width - 50);
    let y = random(-150, -50);
    
    // Maakt vijanden sneller naarmate het level hoger wordt
    let enemy = new Enemy(x, y);
    enemy.speed = random(1, 2 + level * 0.5); // Snelheid neemt toe met level
    
    // Vanaf level 3, sommige vijanden schieten terug
    if (level >= 3 && random() < 0.3) {
      enemy.canShoot = true;
      enemy.shootInterval = random(2000, 4000);
      enemy.lastShot = 0;
    }
    
    // Vanaf level 5, sommige vijanden kunnen achtervolgend zijn
    if (level >= 5 && random() < 0.3) {
      enemy.isHoming = true;
      enemy.homingStrength = 0.5 + (level - 5) * 0.1; // Wordt sterker per level
    }
    
    // Vanaf level 7, sommige vijanden hebben een schild
    if (level >= 7 && random() < 0.2) {
      enemy.hasShield = true;
      enemy.shieldStrength = 2; // Moet meerdere keren geraakt worden
    }
    
    enemies.push(enemy);
  }
  
  // Pas interval aan op basis van level - sneller spawnen op hogere levels
  const spawnTime = Math.max(3000 - level * 200, 1000); // Minimum 1 seconde
  setTimeout(spawnEnemies, spawnTime);
}

function checkLevelUp() {
  // Level omhoog elke 500 punten
  const newLevel = Math.floor(score / 500) + 1;
  
  if (newLevel > level) {
    level = newLevel;
    window.level = level;
    console.log("Level up! New level:", level, "Global level:", window.level);
    
    // Update UI display na level change
    updateUIDisplay();
    
    // Toon level up notificatie
    showLevelUpNotification();
    
    // Geef een extra leven bij elke 2 levels
    if (level % 2 === 0) {
      lives = Math.min(lives + 1, 5); // Maximum van 5 levens
    }
  }
}

function showLevelUpNotification() {
  // Voeg een tijdelijke level-up melding toe aan de UI
  let notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `Level ${level} bereikt!`;
  notification.style.position = 'absolute';
  notification.style.top = '120px';
  notification.style.left = '20px';
  notification.style.color = '#0cf';
  notification.style.fontSize = '24px';
  notification.style.fontWeight = 'bold';
  notification.style.textShadow = '0 0 10px #0cf';
  
  document.querySelector('.game-container').appendChild(notification);
  
  // Verwijder de notificatie na 3 seconden
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function checkCollisions() {
  // Controleer botsingen tussen projectielen en vijanden
  for (let i = projectiles.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (collision(projectiles[i], enemies[j])) {
        let enemy = enemies[j];
        
        // Als de vijand een schild heeft, verminder de sterkte
        if (enemy.hasShield && enemy.shieldStrength > 0) {
          enemy.shieldStrength--;
          // Toon shield hit effect
          createExplosion(enemy.x, enemy.y, 20, 0, 150, 255);
          projectiles.splice(i, 1);
          break;
        } else {
          // Verwijder vijand en projectiel
          createExplosion(enemy.x, enemy.y, 30);
          projectiles.splice(i, 1);
          enemies.splice(j, 1);
          
          // Verhoog score en update globale score
          let pointsGained = 10;
          // Bonus punten voor speciale vijanden
          if (enemy.canShoot) pointsGained += 5;
          if (enemy.isHoming) pointsGained += 10;
          if (enemy.hasShield) pointsGained += 15;
          
          score += pointsGained;
          window.score = score; // Update de score in het window-object
          console.log("Score updated:", score, "Window score:", window.score);
          
          // Update UI nu score veranderd is
          updateUIDisplay();
          
          break;
        }
      }
    }
  }

  // Controleer botsingen tussen speler en vijanden
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (collision(player, enemies[i])) {
      createExplosion(enemies[i].x, enemies[i].y, 40, 255, 100, 0);
      enemies.splice(i, 1);
      lives--;
      
      // Toon schade-effect op speler
      showPlayerDamage();
      
      // Game over als speler geen levens meer heeft
      if (lives <= 0) {
        gameState = "gameOver";
        // Grote explosie voor game over
        createExplosion(player.x, player.y, 100, 255, 0, 0);
      }
    }
  }
  
  // Controleer botsingen tussen vijandelijke projectielen en speler (vanaf level 3)
  if (level >= 3) {
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
      if (collision(enemyProjectiles[i], player)) {
        createExplosion(player.x, player.y, 30, 255, 100, 0);
        enemyProjectiles.splice(i, 1);
        lives--;
        
        // Toon schade-effect op speler
        showPlayerDamage();
        
        // Game over als speler geen levens meer heeft
        if (lives <= 0) {
          gameState = "gameOver";
          // Grote explosie voor game over
          createExplosion(player.x, player.y, 100, 255, 0, 0);
        }
        break;
      }
    }
  }

  // Controleer botsingen tussen speler en powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    if (collision(player, powerups[i])) {
      // Activeer powerup
      activatePowerup();
      
      // Toon effect
      createExplosion(powerups[i].x, powerups[i].y, 30, 255, 100, 255);
      
      // Verwijder powerup
      powerups.splice(i, 1);
      break;
    }
  }
}

function showPlayerDamage() {
  // Flash-effect op het scherm
  let damageFlash = document.createElement('div');
  damageFlash.style.position = 'absolute';
  damageFlash.style.top = '0';
  damageFlash.style.left = '0';
  damageFlash.style.width = '100%';
  damageFlash.style.height = '100%';
  damageFlash.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  damageFlash.style.pointerEvents = 'none';
  
  document.querySelector('.game-container').appendChild(damageFlash);
  
  // Verwijder flash-effect na korte tijd
  setTimeout(() => {
    damageFlash.remove();
  }, 200);
}

function createExplosion(x, y, size, r = 255, g = 200, b = 0) {
  // Maak een explosie-effect met deeltjes
  for (let i = 0; i < 20; i++) {
    let particle = {
      x: x,
      y: y,
      xSpeed: random(-3, 3),
      ySpeed: random(-3, 3),
      size: random(2, size / 5),
      life: random(20, 40),
      maxLife: 40,
      r: r,
      g: g,
      b: b
    };
    explosionParticles.push(particle);
  }
}

function resetGame() {
  console.log("Resetting game...");
  
  // Reset spelstatus
  gameState = "playing";
  
  // Reset spelelementen
  player = new Player(width / 2, height - 50);
  enemies = [];
  projectiles = [];
  enemyProjectiles = [];
  explosionParticles = [];
  powerups = []; // Reset powerups
  
  // Reset spelstatistieken
  score = 0;
  lives = 3;
  level = 1;
  
  // Reset powerup tijd
  lastPowerupTime = millis();
  
  // Reset leaderboard variabelen
  showLeaderboard = false;
  playerEmail = "";
  
  // Update globale variabelen
  window.score = score;
  window.level = level;
  console.log("Global scores reset: score =", window.score, "level =", window.level);
  
  // Update UI display
  updateUIDisplay();
  
  // Start vijanden spawnen
  spawnEnemies();
  
  console.log("Game reset complete");
}

// Voeg update en render toe voor nieuwe arrays
function updateGameElements() {
  // Update explosie deeltjes
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    let particle = explosionParticles[i];
    particle.x += particle.xSpeed;
    particle.y += particle.ySpeed;
    particle.life--;
    
    if (particle.life <= 0) {
      explosionParticles.splice(i, 1);
    }
  }
  
  // Update vijandelijke projectielen
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    enemyProjectiles[i].update();
    enemyProjectiles[i].show();
    
    if (enemyProjectiles[i].offscreen()) {
      enemyProjectiles.splice(i, 1);
    }
  }
  
  // Laat vijanden schieten en volgen
  for (let enemy of enemies) {
    // Schietende vijanden
    if (enemy.canShoot && millis() - enemy.lastShot > enemy.shootInterval) {
      enemy.shoot();
      enemy.lastShot = millis();
    }
    
    // Achtervolgende vijanden
    if (enemy.isHoming && player) {
      let dx = player.x - enemy.x;
      enemy.x += dx * 0.01 * enemy.homingStrength;
    }
  }
  
  // Teken explosie deeltjes
  for (let particle of explosionParticles) {
    let alpha = map(particle.life, 0, particle.maxLife, 0, 255);
    fill(particle.r, particle.g, particle.b, alpha);
    noStroke();
    ellipse(particle.x, particle.y, particle.size);
  }
}

function collision(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  
  // Controleer op overlappende rechthoeken
  if (obj1 instanceof Player) {
    // Voor driehoekige speler, gebruik eenvoudige benadering
    const playerLeft = obj1.x - 15;
    const playerRight = obj1.x + 15;
    const playerTop = obj1.y - 15;
    const playerBottom = obj1.y + 15;
    
    const obj2Left = obj2.x - obj2.width/2;
    const obj2Right = obj2.x + obj2.width/2;
    const obj2Top = obj2.y - obj2.height/2;
    const obj2Bottom = obj2.y + obj2.height/2;
    
    return !(playerRight < obj2Left || 
            playerLeft > obj2Right || 
            playerBottom < obj2Top || 
            playerTop > obj2Bottom);
  } else {
    const obj1Left = obj1.x - obj1.width/2;
    const obj1Right = obj1.x + obj1.width/2;
    const obj1Top = obj1.y - obj1.height/2;
    const obj1Bottom = obj1.y + obj1.height/2;
    
    const obj2Left = obj2.x - obj2.width/2;
    const obj2Right = obj2.x + obj2.width/2;
    const obj2Top = obj2.y - obj2.height/2;
    const obj2Bottom = obj2.y + obj2.height/2;
    
    return !(obj1Right < obj2Left || 
            obj1Left > obj2Right || 
            obj1Bottom < obj2Top || 
            obj1Top > obj2Bottom);
  }
}

// Vijandelijke projectielen klasse
class EnemyProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 15;
    this.speed = 6;
    this.hue = random(0, 40); // Rood tot oranje tinten
  }

  update() {
    this.y += this.speed;
  }

  offscreen() {
    return this.y > height + this.height;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Teken gloed
    colorMode(HSB);
    noStroke();
    fill(this.hue, 255, 255, 50);
    ellipse(0, 0, this.width * 2, this.height);
    
    // Kern
    fill(this.hue, 255, 255);
    ellipse(0, 0, 4, this.height);
    
    // Energie puls
    stroke(this.hue, 255, 255);
    strokeWeight(2);
    line(0, -this.height/2, 0, this.height/2);
    
    colorMode(RGB);
    pop();
  }
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].update();
    powerups[i].show();
    
    // Verwijder powerups die buiten het scherm gaan
    if (powerups[i].offscreen()) {
      powerups.splice(i, 1);
    }
  }
}

function checkPowerupSpawn() {
  // Genereer een powerup elke powerupSpawnTime milliseconden
  if (millis() - lastPowerupTime > powerupSpawnTime) {
    spawnPowerup();
    lastPowerupTime = millis();
    // Varieer de tijd tot de volgende powerup (tussen 8 en 15 seconden)
    powerupSpawnTime = random(8000, 15000);
  }
}

function spawnPowerup() {
  let x = random(50, width - 50);
  powerups.push(new Powerup(x, -20));
}

class Powerup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 2;
    this.rotation = 0;
    this.rotationSpeed = 0.05;
    this.pulseFactor = 0;
    this.pulseSpeed = 0.05;
    this.glowSize = 0;
  }
  
  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
    this.pulseFactor = sin(frameCount * this.pulseSpeed) * 5;
    this.glowSize = 10 + sin(frameCount * this.pulseSpeed) * 5;
  }
  
  offscreen() {
    return this.y > height + this.height;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Buitenste glow
    noStroke();
    fill(255, 100, 255, 100);
    ellipse(0, 0, this.width + this.glowSize, this.height + this.glowSize);
    
    // Binnenste glow
    fill(255, 200, 0, 150);
    ellipse(0, 0, this.width + this.pulseFactor, this.height + this.pulseFactor);
    
    // Kern
    fill(255);
    ellipse(0, 0, this.width - 10, this.height - 10);
    
    // Symboliek voor triple fire
    fill(255, 100, 255);
    for (let i = 0; i < 3; i++) {
      let angle = i * TWO_PI / 3;
      let x = cos(angle) * 8;
      let y = sin(angle) * 8;
      ellipse(x, y, 5, 5);
    }
    
    // Symboliek voor rapid fire
    stroke(255, 200, 0);
    strokeWeight(2);
    line(-10, 0, 10, 0);
    line(0, -10, 0, 10);
    
    pop();
  }
}

function activatePowerup() {
  // Activeer triple fire voor 15 seconden
  player.tripleFireActive = true;
  player.tripleFireEndTime = millis() + 15000;
  
  // Activeer rapid fire voor 15 seconden
  player.rapidFireActive = true;
  player.rapidFireEndTime = millis() + 15000;
  
  // Toon powerup notification
  showPowerupNotification();
}

function showPowerupNotification() {
  // Voeg een tijdelijke powerup melding toe aan de UI
  let notification = document.createElement('div');
  notification.className = 'powerup-notification';
  notification.innerHTML = 'POWERUP: TRIPLE SHOT + RAPID FIRE!';
  notification.style.position = 'absolute';
  notification.style.top = '200px';
  notification.style.left = width / 2 - 150 + 'px';
  notification.style.color = '#ff55ff';
  notification.style.fontSize = '20px';
  notification.style.fontWeight = 'bold';
  notification.style.textShadow = '0 0 10px #ff55ff';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '100';
  
  document.querySelector('.game-container').appendChild(notification);
  
  // Verwijder de notificatie na 3 seconden
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function drawEmailForm() {
  // Container met achtergrond
  fill(0, 20, 40, 220);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 150, 400, 200, 10);
  
  // E-mailformulier titel
  fill(0, 255, 255);
  textSize(20);
  text("Voer je e-mail in voor de leaderboard:", width / 2, height / 2 + 100);
  
  // E-mail inputveld
  fill(30, 40, 50);
  stroke(0, 200, 255);
  strokeWeight(2);
  rect(width / 2, height / 2 + 140, 300, 40, 5);
  
  // Toon ingevoerde e-mail
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(16);
  text(playerEmail + (frameCount % 30 < 15 ? "|" : ""), width / 2 - 140, height / 2 + 140);
  textAlign(CENTER, CENTER);
  
  // Submit knop
  drawSubmitButton();
  
  // Terug naar startscherm knop
  fill(80, 80, 100);
  noStroke();
  rect(width / 2, height / 2 + 220, 200, 30, 5);
  
  fill(200, 200, 220);
  textSize(14);
  text("OPNIEUW SPELEN", width / 2, height / 2 + 220);
}

function drawSubmitButton() {
  // Maak een submit knop
  let buttonX = width / 2;
  let buttonY = height / 2 + 180;
  let buttonWidth = 150;
  let buttonHeight = 40;
  
  // Controleer of muis over de knop is
  let mouseOver = mouseX > buttonX - buttonWidth/2 && mouseX < buttonX + buttonWidth/2 &&
                  mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2;
  
  // Teken de knop
  if (mouseOver) {
    fill(0, 180, 255);
  } else {
    fill(0, 120, 200);
  }
  
  noStroke();
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
  
  // Knoptekst
  fill(255);
  textSize(16);
  text("VERSTUUR SCORE", buttonX, buttonY);
}

function drawLeaderboard() {
  // Container met achtergrond
  fill(0, 20, 40, 220);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 150, 500, 300, 10);
  
  // Leaderboard titel
  fill(0, 255, 255);
  textSize(24);
  text("TOP SPELERS", width / 2, height / 2 + 30);
  
  // Titels voor kolommen
  fill(150, 200, 255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("RANG", width / 2 - 220, height / 2 + 60);
  text("NAAM", width / 2 - 170, height / 2 + 60);
  text("SCORE", width / 2 + 50, height / 2 + 60);
  text("LEVEL", width / 2 + 150, height / 2 + 60);
  
  // Teken horizontale lijn
  stroke(100, 150, 200);
  strokeWeight(1);
  line(width / 2 - 230, height / 2 + 75, width / 2 + 230, height / 2 + 75);
  
  if (leaderboardData.length === 0 || supabaseLoading) {
    // Toon laadmelding als er nog geen data is of als we nog aan het laden zijn
    noStroke();
    fill(200, 200, 200);
    textAlign(CENTER, CENTER);
    
    if (supabaseLoading) {
      // Toon een animatie tijdens het laden
      let loadingText = "Leaderboard laden";
      let dots = ".".repeat(floor(frameCount / 20) % 4);
      text(loadingText + dots, width / 2, height / 2 + 120);
    } else {
      text("Leaderboard laden...", width / 2, height / 2 + 120);
    }
  } else {
    // Toon leaderboard data
    noStroke();
    textAlign(LEFT, CENTER);
    
    for (let i = 0; i < Math.min(leaderboardData.length, 10); i++) {
      let entry = leaderboardData[i];
      let y = height / 2 + 90 + i * 30;
      
      // Wissel achtergrondkleur voor betere leesbaarheid
      if (i % 2 === 0) {
        fill(30, 40, 60, 100);
        rectMode(CENTER);
        rect(width / 2, y, 460, 25);
      }
      
      // Highlight huidige speler
      let isCurrentPlayer = entry.email === playerEmail && entry.score === score;
      
      // Rang
      fill(isCurrentPlayer ? 255 : 250, isCurrentPlayer ? 255 : 250, isCurrentPlayer ? 0 : 200);
      text(`#${i + 1}`, width / 2 - 220, y);
      
      // Speler e-mail/naam (afbreken als te lang)
      let displayName = entry.name || formatEmail(entry.email);
      if (displayName.length > 20) {
        displayName = displayName.substring(0, 17) + "...";
      }
      fill(isCurrentPlayer ? 255 : 255, isCurrentPlayer ? 255 : 255, isCurrentPlayer ? 0 : 255);
      text(displayName, width / 2 - 170, y);
      
      // Score
      fill(isCurrentPlayer ? 255 : 0, isCurrentPlayer ? 255 : 255, isCurrentPlayer ? 0 : 255);
      text(entry.score, width / 2 + 50, y);
      
      // Level
      fill(isCurrentPlayer ? 255 : 255, isCurrentPlayer ? 255 : 200, isCurrentPlayer ? 0 : 0);
      text(entry.level, width / 2 + 150, y);
    }
  }
  
  // Terug naar startscherm knop
  textAlign(CENTER, CENTER);
  fill(80, 80, 100);
  noStroke();
  rect(width / 2, height / 2 + 250, 200, 30, 5);
  
  fill(200, 200, 220);
  textSize(14);
  text("OPNIEUW SPELEN", width / 2, height / 2 + 250);
}

function formatEmail(email) {
  if (!email) return "Anoniem";
  
  // Verberg een deel van de e-mail voor privacy
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const name = parts[0];
  const domain = parts[1];
  
  if (name.length <= 3) {
    return email; // Niet verbergen als naam erg kort is
  }
  
  const visiblePart = name.substring(0, 3);
  const hiddenPart = '*'.repeat(Math.min(name.length - 3, 3));
  
  return `${visiblePart}${hiddenPart}@${domain}`;
}

function submitScore() {
  // Voer e-mailvalidatie uit
  if (!isValidEmail(playerEmail) && playerEmail !== "") {
    // Toon een foutmelding
    showErrorMessage("Voer een geldig e-mailadres in");
    return;
  }
  
  // Gegevens die we naar Supabase willen sturen
  const playerData = {
    email: playerEmail || "anoniem",
    score: score,
    level: level,
    created_at: new Date().toISOString()
  };
  
  console.log("Score verzonden:", playerData);
  supabaseLoading = true;
  
  // Controleer of Supabase beschikbaar is
  if (supabase) {
    // Score naar Supabase verzenden
    supabase
      .from('leaderboard')
      .insert([playerData])
      .then(response => {
        if (response.error) {
          console.error('Fout bij opslaan score:', response.error);
          showErrorMessage("Er is een fout opgetreden bij het verzenden van je score");
          fetchLeaderboardFallback();
        } else {
          console.log('Score succesvol opgeslagen');
          fetchLeaderboard();
        }
        showLeaderboard = true;
        supabaseLoading = false;
      })
      .catch(error => {
        console.error('Supabase error:', error);
        showErrorMessage("Er is een fout opgetreden bij het verzenden van je score");
        fetchLeaderboardFallback();
        showLeaderboard = true;
        supabaseLoading = false;
      });
  } else {
    // Fallback als Supabase niet beschikbaar is
    console.log('Supabase niet beschikbaar, gebruik fallback');
    setTimeout(() => {
      fetchLeaderboardFallback();
      showLeaderboard = true;
      supabaseLoading = false;
    }, 500);
  }
}

function isValidEmail(email) {
  // Basisvalidatie voor e-mail
  if (email === "") return true; // Leeg is ook geldig (anoniem)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showErrorMessage(message) {
  // Creëer een foutmelding element en voeg het toe aan het canvas
  let notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = message;
  notification.style.position = 'absolute';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.color = '#ff3333';
  notification.style.fontSize = '18px';
  notification.style.fontWeight = 'bold';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  notification.style.padding = '15px 25px';
  notification.style.borderRadius = '5px';
  notification.style.border = '2px solid #ff6666';
  notification.style.zIndex = '100';
  
  document.querySelector('.game-container').appendChild(notification);
  
  // Verwijder de notificatie na 3 seconden
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function fetchLeaderboard() {
  supabaseLoading = true;
  
  // Controleer of Supabase beschikbaar is
  if (supabase) {
    // Haal top scores op van Supabase
    supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
      .then(response => {
        if (response.error) {
          console.error('Fout bij ophalen leaderboard:', response.error);
          fetchLeaderboardFallback();
        } else {
          console.log('Leaderboard data opgehaald:', response.data);
          leaderboardData = response.data;
          
          // Voeg huidige speler toe als deze niet al in de top 10 zit
          const playerInList = leaderboardData.some(entry => 
            entry.email === playerEmail && entry.score === score && entry.level === level
          );
          
          if (!playerInList && playerEmail) {
            leaderboardData.push({
              email: playerEmail,
              score: score,
              level: level
            });
            
            // Sorteer opnieuw
            leaderboardData.sort((a, b) => b.score - a.score);
            
            // Beperk tot 10 items
            if (leaderboardData.length > 10) {
              leaderboardData = leaderboardData.slice(0, 10);
            }
          }
        }
        supabaseLoading = false;
      })
      .catch(error => {
        console.error('Supabase error:', error);
        fetchLeaderboardFallback();
        supabaseLoading = false;
      });
  } else {
    // Fallback als Supabase niet beschikbaar is
    console.log('Supabase niet beschikbaar, gebruik fallback');
    setTimeout(() => {
      fetchLeaderboardFallback();
      supabaseLoading = false;
    }, 500);
  }
}

function fetchLeaderboardFallback() {
  console.log('Fallback naar mock leaderboard data');
  // Simuleer leaderboard data voor het geval er een probleem is met Supabase
  leaderboardData = [
    { email: "speler1@example.com", score: 5200, level: 8 },
    { email: "topplayer@gmail.com", score: 4800, level: 7 },
    { email: "gamer123@hotmail.com", score: 4500, level: 7 },
    { email: "aiplayer@example.nl", score: 3900, level: 6 },
    { email: "ruimteheld@gmail.com", score: 3600, level: 6 },
    { email: "defender@example.com", score: 3300, level: 5 },
    { email: "sentinel@gmail.com", score: 2900, level: 5 },
    { email: "neural_master@example.org", score: 2700, level: 4 },
    { email: "quantum_player@mail.nl", score: 2400, level: 4 },
    { email: "space_warrior@test.com", score: 2100, level: 3 }
  ];
  
  // Voeg huidige speler toe en sorteer
  if (playerEmail) {
    leaderboardData.push({ email: playerEmail, score: score, level: level });
    // Sorteer op score (hoogste eerst)
    leaderboardData.sort((a, b) => b.score - a.score);
    
    // Beperk tot 10 items
    if (leaderboardData.length > 10) {
      leaderboardData = leaderboardData.slice(0, 10);
    }
  }
}

// Functie om de UI elementen te updaten - voeg dit toe na de resetGame functie
function updateUIDisplay() {
  // Zorg dat de globale variabelen altijd worden bijgewerkt
  if (typeof window !== 'undefined') {
    // Forceer de waarden juist te zijn
    window.score = score;
    window.level = level;
    
    // Log de update voor debugging
    console.log("UI Update - Score:", score, "Level:", level, "Window score:", window.score, "Window level:", window.level);
  } else {
    console.error("Window object niet beschikbaar voor score update");
  }
  
  // Update DOM elementen direct als ze bestaan
  try {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.textContent = score;
    
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) levelDisplay.textContent = level;
    
    // Update de externe score-display voor extra zichtbaarheid
    const externalScore = document.getElementById('external-score');
    if (externalScore) {
      externalScore.style.display = 'block'; // Zorg dat het zichtbaar is
    }
  } catch (e) {
    // Negeer DOM fouten als we in een niet-DOM context zijn
    console.log("DOM update fout:", e.message);
  }
}

// Voeg een aanroep van updateUIDisplay toe aan de draw functie in de playing state
// en aan andere relevante plekken waar score/level wordt bijgewerkt