precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Color palette for spiral
vec3 psychedelicGradient(float t) {
  // DMT-inspired psychedelic palette
  vec3 magenta = vec3(1.0, 0.0, 1.0);     // Magenta
  vec3 cyan = vec3(0.0, 1.0, 1.0);        // Cyan
  vec3 gold = vec3(1.0, 0.9, 0.2);        // Golden
  vec3 purple = vec3(0.6, 0.0, 0.8);      // Purple
  vec3 emerald = vec3(0.0, 0.8, 0.4);     // Emerald green
  
  // Time modulators for "breathing" effect
  float mod1 = 0.2 * sin(uTime * 0.3);
  float mod2 = 0.2 * cos(uTime * 0.24);
  
  magenta += vec3(mod1, 0.0, mod2);
  cyan += vec3(0.0, mod1, mod2);
  
  // Cycle through colors
  t = fract(t + uTime * 0.1);
  
  if(t < 0.2) return mix(magenta, cyan, t * 5.0);
  else if(t < 0.4) return mix(cyan, gold, (t - 0.2) * 5.0);
  else if(t < 0.6) return mix(gold, purple, (t - 0.4) * 5.0);
  else if(t < 0.8) return mix(purple, emerald, (t - 0.6) * 5.0);
  else return mix(emerald, magenta, (t - 0.8) * 5.0);
}

// Spiral pattern function
float spiral(vec2 uv, float thickness, float frequency, float phase) {
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Create spiral pattern
  float spiral = sin(theta * frequency + r * 10.0 - phase);
  
  // Create bands with smooth edges
  return smoothstep(-thickness, thickness, spiral);
}

// Fractal noise for organic movement
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  // Unroll loop to avoid non-constant iteration count
  // First octave
  value += amplitude * (
    sin(p.x * frequency) * sin(p.y * frequency) +
    cos(p.x * frequency * 1.1) * cos(p.y * frequency * 1.1)
  ) * 0.5 + 0.5;
  
  frequency *= 2.0;
  amplitude *= 0.5;
  
  // Second octave
  value += amplitude * (
    sin(p.x * frequency) * sin(p.y * frequency) +
    cos(p.x * frequency * 1.1) * cos(p.y * frequency * 1.1)
  ) * 0.5 + 0.5;
  
  frequency *= 2.0;
  amplitude *= 0.5;
  
  // Third octave
  value += amplitude * (
    sin(p.x * frequency) * sin(p.y * frequency) +
    cos(p.x * frequency * 1.1) * cos(p.y * frequency * 1.1)
  ) * 0.5 + 0.5;
  
  return value;
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;

  uv = uv * 0.55;
  
  // Create multiple layers of distortion for more complexity
  vec2 distortedUV = uv;
  
  // Add time-based rotation to the entire scene
  float rotationSpeed = uTime * 0.1;
  mat2 rotation = mat2(
    cos(rotationSpeed), -sin(rotationSpeed),
    sin(rotationSpeed), cos(rotationSpeed)
  );
  distortedUV = rotation * distortedUV;
  
  // Add pulsing zoom effect
  float zoom = sin(uTime * 0.2) * 0.1 + 0.9;
  distortedUV /= zoom;
  
  // Add fractal distortion
  vec2 fbmOffset = vec2(
    fbm(distortedUV + vec2(uTime * 0.1, 0.0)),
    fbm(distortedUV + vec2(0.0, uTime * 0.12))
  );
  
  distortedUV += fbmOffset * 0.2;
  
  // Get polar coordinates
  float r = length(distortedUV);
  float theta = atan(distortedUV.y, distortedUV.x);
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Create multiple spiral layers with different frequencies and phases
  const int SPIRAL_LAYERS = 5;
  for (int i = 0; i < SPIRAL_LAYERS; i++) {
    float layerSeed = float(i) * 0.61803; // Golden ratio for variety
    float frequency = 3.0 + layerSeed * 5.0;
    float phase = uTime * (0.5 + layerSeed * 0.5);
    float thickness = 0.1 + 0.1 * sin(uTime * 0.3 + layerSeed);
    
    // Create spiral pattern
    float spiralPattern = spiral(distortedUV, thickness, frequency, phase);
    
    // Apply color based on distance and angle
    float colorIndex = fract(r + theta / (2.0 * PI) + layerSeed + uTime * 0.05);
    vec3 spiralColor = psychedelicGradient(colorIndex);
    
    // Add to final color
    color += spiralColor * spiralPattern * (0.3 - float(i) * 0.05);
  }
  
  // Add a second set of counter-rotating spirals
  vec2 reverseUV = vec2(-distortedUV.y, distortedUV.x); // 90-degree rotation
  for (int i = 0; i < 3; i++) {
    float layerSeed = float(i) * 0.7548;
    float frequency = 2.0 + layerSeed * 3.0;
    float phase = -uTime * (0.3 + layerSeed * 0.4);
    float thickness = 0.05 + 0.05 * cos(uTime * 0.4 + layerSeed);
    
    float spiralPattern = spiral(reverseUV, thickness, frequency, phase);
    float colorIndex = fract(r - theta / (2.0 * PI) + layerSeed + uTime * 0.07);
    vec3 spiralColor = psychedelicGradient(1.0 - colorIndex);
    
    color += spiralColor * spiralPattern * 0.2;
  }
  
  // Add pulsing center
  float centerPulse = sin(uTime * 1.5) * 0.5 + 0.5;
  float centerGlow = smoothstep(0.3 + centerPulse * 0.2, 0.0, r);
  color += psychedelicGradient(uTime * 0.1) * centerGlow;
  
  // Add floating particles that follow the spiral
  const int PARTICLES = 15;
  for (int i = 0; i < PARTICLES; i++) {
    float particleSeed = float(i) * 0.043;
    float particleTime = uTime * (0.2 + particleSeed * 0.2);
    
    // Spiral movement pattern
    float angle = particleTime * 2.0 + particleSeed * 10.0;
    float radius = particleSeed * 0.8 + 0.1 * sin(particleTime * 3.0);
    radius *= (sin(particleTime * 0.5) * 0.3 + 0.7); // Pulsing radius
    
    vec2 particlePos = vec2(
      sin(angle) * radius,
      cos(angle) * radius
    );
    
    // Create glowing particle
    float particle = smoothstep(0.03 + sin(particleTime * 2.0) * 0.01, 0.0, length(distortedUV - particlePos));
    
    // Add to scene with color
    color += psychedelicGradient(particleSeed + uTime * 0.1) * particle * 0.7;
  }
  
  // Add subtle vignette
  float vignette = smoothstep(1.5, 0.5, r);
  color *= vignette * 1.3;
  
  // Add bloom/glow
  color = pow(color, vec3(0.8));
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}