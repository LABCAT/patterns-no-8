precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Bamboo stalk function
float bambooStalk(vec2 uv, vec2 pos, float width, float height) {
  float distX = abs(uv.x - pos.x);
  float stalk = smoothstep(width, width - 0.01, distX) * smoothstep(height, 0.0, uv.y - pos.y);
  
  // Add bamboo segments/nodes
  float segmentCount = 8.0;
  float segmentHeight = height / segmentCount;
  
  const int MAX_SEGMENTS = 10;  // Set a constant maximum
    for (int i = 0; i < MAX_SEGMENTS; i++) {
        if(float(i) >= segmentCount) break;  // Early exit if we reach our desired count
        float nodeY = pos.y + float(i) * segmentHeight;
        float node = smoothstep(0.02, 0.0, abs(uv.y - nodeY)) * smoothstep(width * 1.5, width * 1.5 - 0.01, distX);
        stalk += node * 0.5;
    }
  
  return stalk;
}

// Bird shape function
float bird(vec2 uv, vec2 pos, float size, float wing) {
  // Transform coordinates relative to bird position
  vec2 birdUV = (uv - pos) / size;
  
  // Bird body (oval shape)
  float body = smoothstep(0.15, 0.14, length(birdUV * vec2(1.0, 1.5)));
  
  // Bird head
  float head = smoothstep(0.12, 0.11, length(birdUV - vec2(0.15, 0.0)));
  
  // Bird tail
  float tail = smoothstep(0.15, 0.14, length((birdUV - vec2(-0.25, 0.0)) * vec2(1.5, 0.7)));
  
  // Bird wings - animated
  float wingFlap = sin(uTime * 2.0 + wing) * 0.5 + 0.5;
  float leftWing = smoothstep(0.15, 0.14, length((birdUV - vec2(0.0, 0.15 + wingFlap * 0.1)) * vec2(0.7, 1.2)));
  float rightWing = smoothstep(0.15, 0.14, length((birdUV - vec2(0.0, -0.15 - wingFlap * 0.1)) * vec2(0.7, 1.2)));
  
  return body + head + tail + leftWing + rightWing;
}

// Color palette for jungle/bamboo
vec3 jungleGradient(float t) {
  // DMT-inspired jungle palette
  vec3 emerald = vec3(0.0, 0.8, 0.4);     // Emerald green
  vec3 jade = vec3(0.0, 0.6, 0.3);        // Jade green
  vec3 gold = vec3(1.0, 0.9, 0.2);        // Golden highlights
  vec3 skyblue = vec3(0.4, 0.7, 1.0);     // Sky blue
  
  // Time modulators for "breathing" effect
  float mod1 = 0.1 * sin(uTime * 0.3);
  float mod2 = 0.1 * cos(uTime * 0.24);
  
  jade += vec3(mod1, mod2, 0.0);
  emerald += vec3(0.0, mod1, mod2);
  
  if(t < 0.33) return mix(jade, emerald, t * 3.0);
  else if(t < 0.66) return mix(emerald, skyblue, (t - 0.33) * 3.0);
  else return mix(skyblue, gold, (t - 0.66) * 3.0);
}

// Color palette for birds
vec3 birdGradient(float t, float seed) {
  // DMT-inspired impossible bird colors
  vec3 magenta = vec3(1.0, 0.0, 1.0);    // Magenta
  vec3 cyan = vec3(0.0, 1.0, 1.0);       // Cyan
  vec3 golden = vec3(1.0, 0.8, 0.0);     // Golden
  vec3 purple = vec3(0.6, 0.0, 0.8);     // Purple
  
  // Add time-based modulation for color cycling
  float phase = seed + uTime * 0.2;
  t = fract(t + phase);
  
  // Create a cycling palette
  if(t < 0.25) return mix(magenta, cyan, t * 4.0);
  else if(t < 0.5) return mix(cyan, golden, (t - 0.25) * 4.0);
  else if(t < 0.75) return mix(golden, purple, (t - 0.5) * 4.0);
  else return mix(purple, magenta, (t - 0.75) * 4.0);
}

// Helper function for rotation
vec2 rotate(vec2 uv, float angle) {
  return vec2(
    uv.x * cos(angle) - uv.y * sin(angle),
    uv.x * sin(angle) + uv.y * cos(angle)
  );
}

// Light ray effect
float lightRay(vec2 uv, float angle, float width) {
  float ray = smoothstep(width, 0.0, abs(mod(atan(uv.y, uv.x) + PI + angle, 2.0 * PI) - PI));
  return ray * smoothstep(1.0, 0.2, length(uv));
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;
  
  // Add slight distortion for wavy/breathing effect
  uv += vec2(
    sin(uv.y * 4.0 + uTime * 0.5) * 0.02,
    cos(uv.x * 4.0 + uTime * 0.4) * 0.02
  );
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Create background forest gradient
  vec3 bgColor = jungleGradient(r * 0.7 + sin(uTime * 0.1) * 0.1);
  
  // Add light rays coming through bamboo
  const int RAYS = 5;
  for (int i = 0; i < RAYS; i++) {
    float rayAngle = float(i) * PI / float(RAYS) + uTime * 0.1;
    float rayWidth = 0.05 + 0.03 * sin(uTime * 0.2 + float(i));
    float ray = lightRay(uv, rayAngle, rayWidth);
    color += vec3(1.0, 0.9, 0.7) * ray * 0.15;
  }
  
  // Add color from the background
  color += bgColor * 0.5;
  
  // Create multiple bamboo stalks
  const int BAMBOO_COUNT = 8;
  for (int i = 0; i < BAMBOO_COUNT; i++) {
    // Distribute bamboo across the x-axis with some randomness
    float xPos = mix(-1.3, 1.3, fract(float(i) / float(BAMBOO_COUNT) + sin(float(i) * 0.74) * 0.2));
    // Vary height and width slightly
    float bambooHeight = 2.0 + sin(float(i) * 0.9) * 0.2;
    float bambooWidth = 0.03 + sin(float(i) * 1.2) * 0.01;
    
    float stalk = bambooStalk(uv, vec2(xPos, -1.0), bambooWidth, bambooHeight);
    
    // Adjust bamboo color based on position (depth illusion)
    float depthFactor = 0.5 + 0.5 * sin(float(i) * 0.7);
    vec3 bambooColor = jungleGradient(depthFactor);
    bambooColor *= 0.7 + 0.3 * sin(uv.y * 5.0 + uTime * 0.2); // Add subtle variation
    
    color += bambooColor * stalk;
  }
  
  // Add ethereal birds flying around
  const int BIRD_COUNT = 6;
  for (int i = 0; i < BIRD_COUNT; i++) {
    // Create a unique seed for this bird
    float seed = float(i) * 0.123;
    
    // Create bird path - a figure-8 or circular path
    float birdTime = uTime * (0.2 + seed * 0.1);
    float birdX = sin(birdTime + seed * 10.0) * 0.5;
    float birdY = sin(birdTime * 2.0 + seed * 5.0) * 0.3;
    
    // Adjust size and wing phase based on bird index
    float birdSize = 0.05 + seed * 0.05;
    float wingPhase = seed * 10.0;
    
    // Create the bird
    float birdShape = bird(uv, vec2(birdX, birdY), birdSize, wingPhase);
    
    // Get bird color - vivid and shifting
    vec3 birdColor = birdGradient(float(i) / float(BIRD_COUNT), seed);
    
    // Add glow around the bird
    float birdGlow = smoothstep(birdSize * 3.0, birdSize, length(uv - vec2(birdX, birdY))) * 0.5;
    
    // Add the bird to the scene
    color += birdColor * (birdShape + birdGlow);
  }
  
  // Add misty atmosphere and particles
  float mist = sin(uv.x * 5.0 + uTime * 0.2) * sin(uv.y * 4.0 - uTime * 0.3) * 0.5 + 0.5;
  mist *= smoothstep(0.0, 0.5, r) * smoothstep(1.0, 0.7, r);
  color += jungleGradient(mist) * mist * 0.2;
  
  // Add floating particles/spores
  const int PARTICLES = 20;
  for (int i = 0; i < PARTICLES; i++) {
    float particleSeed = float(i) * 0.043;
    float particleTime = uTime * (0.1 + particleSeed * 0.1);
    
    // Spiral movement pattern
    float angle = particleTime + particleSeed * 10.0;
    float radius = 0.1 + particleSeed + 0.05 * sin(particleTime * 2.0);
    vec2 particlePos = vec2(
      sin(angle) * radius * 1.5,
      cos(angle) * radius + sin(particleTime) * 0.2
    );
    
    // Create particle
    float particle = smoothstep(0.01, 0.0, length(uv - particlePos));
    
    // Add to scene with color
    color += birdGradient(particleSeed, particleSeed) * particle;
  }
  
  // Add subtle vignette
  float vignette = smoothstep(1.2, 0.5, r);
  color *= vignette * 1.2;
  
  // Add bloom/glow
  color = pow(color, vec3(0.8));
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}