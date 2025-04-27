precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Spiral flower function
float spiralFlower(vec2 uv, float petals, float radius) {
  float angle = atan(uv.y, uv.x);
  float len = length(uv);
  
  // Add spiral effect
  float spiral = 0.3 * (sin(len * 8.0 - uTime * 0.7) + cos(angle * 3.0));
  angle += spiral;
  
  // Create more organic petal shape
  float shape = sin(angle * petals) * 0.5 + 0.5;
  shape = pow(shape, 1.5) * (0.8 + 0.2 * sin(angle * petals * 3.0 + uTime * 0.5));
  
  // Add flowing veins through petals
  float veins = smoothstep(0.04, 0.0, abs(sin(angle * petals * 2.0 + len * 10.0 - uTime * 0.4)));
  veins *= smoothstep(1.0, 0.3, len) * 0.4;
  
  // Create the final flower shape
  float flower = 1.0 - smoothstep(radius * shape, radius * shape + 0.01, len);
  return flower + veins;
}

// Helper function for rotation
vec2 rotate(vec2 uv, float angle) {
  return vec2(
    uv.x * cos(angle) - uv.y * sin(angle),
    uv.x * sin(angle) + uv.y * cos(angle)
  );
}

// Color gradient function with dreamier palette
vec3 dreamyGradient(float t) {
  vec3 innerColor = vec3(0.95, 0.8, 1.0);  // Soft lilac
  vec3 midColor = vec3(0.5, 0.85, 0.95);   // Sky blue
  vec3 outerColor = vec3(0.9, 0.5, 0.85);  // Rose pink
  vec3 edgeColor = vec3(0.4, 0.3, 0.8);    // Deep purple
  
  if(t < 0.33) return mix(innerColor, midColor, t/0.33);
  else if(t < 0.66) return mix(midColor, outerColor, (t-0.33)/0.33);
  else return mix(outerColor, edgeColor, (t-0.66)/0.34);
}

// Glowing orb effect
float glowingOrb(vec2 uv, vec2 position, float radius) {
  float dist = length(uv - position);
  return exp(-dist * dist / radius);
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Add center glow
  float centerGlow = exp(-r * 2.0) * 0.15;
  color += vec3(0.8, 0.9, 1.0) * centerGlow;
  
  // Create multiple flower layers
  const int LAYERS = 5;
  for (int i = 0; i < LAYERS; i++) {
    float scale = 1.0 - float(i) * 0.17;
    float rotSpeed = (float(i) * 0.2 + 0.1) * (sin(uTime * 0.1) * 0.5 + 0.5);
    vec2 rotUV = rotate(uv, uTime * rotSpeed);
    
    // Varying petal counts for different layers
    float petals = float(5 + i * 3);
    float pulseFreq = 0.25 + float(i) * 0.08;
    float sizePulse = 0.6 + 0.4 * sin(uTime * pulseFreq);
    
    // Get flower pattern
    float flowerPattern = spiralFlower(rotUV * scale, petals, sizePulse);
    
    // Get color for this layer
    vec3 layerColor = dreamyGradient(float(i) / float(LAYERS-1));
    
    // Add pulsing rings
    float ringRadius = 0.3 + float(i) * 0.15;
    float ringPulse = sin(uTime * (0.3 + float(i) * 0.05) + float(i));
    float ring = smoothstep(0.03, 0.0, abs(r - (ringRadius + 0.2 * ringPulse)));
    
    // Add to final color
    color += layerColor * flowerPattern * 0.25 + layerColor * ring * 0.15;
  }
  
  // Add floating orbs
  const int ORBS = 7;
  for (int i = 0; i < ORBS; i++) {
    float angle = float(i) * (2.0 * PI / float(ORBS)) + uTime * 0.2;
    float distance = 0.3 + 0.15 * sin(uTime * 0.3 + float(i));
    vec2 orbPos = vec2(cos(angle), sin(angle)) * distance;
    
    float orb = glowingOrb(uv, orbPos, 0.08);
    vec3 orbColor = dreamyGradient(float(i) / float(ORBS));
    
    color += orbColor * orb * 0.3;
  }
  
  // Add star-like effect in the background
  float stars = pow(sin(uv.x * 30.0) * sin(uv.y * 30.0) * 0.5 + 0.5, 5.0);
  stars *= smoothstep(0.7, 1.0, r) * 0.2;
  color += vec3(0.9, 0.95, 1.0) * stars;
  
  // Add flowing light rays
  for (int i = 0; i < 8; i++) {
    float rayAngle = float(i) * PI / 4.0 + uTime * 0.1;
    float ray = smoothstep(0.05, 0.0, abs(mod(theta - rayAngle, 2.0 * PI) - PI));
    ray *= smoothstep(0.0, 0.2, r) * smoothstep(1.0, 0.7, r) * (0.5 + 0.5 * sin(r * 15.0 + uTime));
    
    color += vec3(0.8, 0.9, 1.0) * ray * 0.15;
  }
  
  // Add a pulsing outer ring
  float outerRing = smoothstep(0.04, 0.0, abs(r - (0.8 + 0.1 * sin(uTime * 0.5))));
  color += vec3(0.7, 0.6, 0.9) * outerRing * 0.3;
  
  // Adjust overall brightness
  color = pow(color, vec3(0.75));
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}