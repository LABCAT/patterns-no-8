precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359
#define ITERATIONS 12

// Complex number operations
vec2 complexMul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexPow(vec2 z, float power) {
  float r = length(z);
  float angle = atan(z.y, z.x);
  return pow(r, power) * vec2(cos(angle * power), sin(angle * power));
}

// Fractal function
float fractal(vec2 uv) {
  vec2 z = uv;
  vec2 c = vec2(0.7885 * sin(uTime * 0.1) - 0.12, 0.6534 * cos(uTime * 0.07) + 0.2);
  float iter = 0.0;
  
  // Apply time distortion to the initial values
  float timeMod = sin(uTime * 0.3) * 0.2;
  z += vec2(cos(uTime * 0.25) * 0.1, sin(uTime * 0.27) * 0.1);
  
  for (int i = 0; i < ITERATIONS; i++) {
    // Modified Mandelbrot/Julia hybrid with time influence
    z = complexPow(z, 2.3 + sin(uTime * 0.05) * 0.2) + c; 
    
    // Break if we're heading to infinity
    if (length(z) > 4.0) {
      break;
    }
    
    iter++;
  }
  
  // Normalize from 0-1
  return iter / float(ITERATIONS);
}

// Animation wave
vec2 waveDistortion(vec2 uv) {
  float time = uTime * 0.8;
  
  // Create distortion waves that move through the space
  float distortX = sin(uv.y * 4.0 + time) * cos(uv.x * 2.0 - time * 0.5) * 0.02;
  float distortY = cos(uv.x * 3.0 + time * 0.7) * sin(uv.y * 2.5 - time * 0.3) * 0.02;
  
  return uv + vec2(distortX, distortY);
}

vec3 psychedelicGradient(float t) {
  // Vibrant, impossible DMT-like colors
  vec3 a = vec3(0.5, 0.0, 1.0);    // Deep purple
  vec3 b = vec3(1.0, 0.2, 0.8);    // Hot pink
  vec3 c = vec3(0.1, 0.9, 1.0);    // Cyan
  vec3 d = vec3(1.0, 0.9, 0.1);    // Gold
  
  // Add more vibrance using sin waves in time
  float sinT = sin(uTime * 0.2) * 0.5 + 0.5;
  
  // Multi-segment gradient for alien-looking colors
  if (t < 0.25) return mix(a, b, t * 4.0) * (1.0 + 0.2 * sinT);
  else if (t < 0.5) return mix(b, c, (t - 0.25) * 4.0) * (1.0 + 0.2 * cos(uTime * 0.3));
  else if (t < 0.75) return mix(c, d, (t - 0.5) * 4.0) * (1.0 + 0.15 * sin(uTime * 0.4));
  else return mix(d, a, (t - 0.75) * 4.0) * (1.0 + 0.25 * cos(uTime * 0.25));
}

// Kaleidoscope effect
vec2 kaleidoscope(vec2 uv, float segments) {
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);
  
  // Divide space into segments
  float segmentAngle = 2.0 * PI / segments;
  
  // Calculate which segment we're in
  float segmentIndex = floor(angle / segmentAngle);
  
  // Remap to -segmentAngle/2 to +segmentAngle/2
  float remappedAngle = mod(angle, segmentAngle);
  if (remappedAngle > segmentAngle / 2.0) {
    remappedAngle = segmentAngle - remappedAngle;
  }
  
  // Return the mirrored coordinates
  return vec2(cos(remappedAngle), sin(remappedAngle)) * radius;
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Create a folding space-time perspective warp
  float warpFactor = 0.5 + 0.5 * sin(uTime * 0.1);
  uv = uv / (1.0 - r * warpFactor);
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Animated kaleidoscope segments
  float kalSegments = 5.0 + floor(sin(uTime * 0.05) * 2.0 + 2.0);
  vec2 kalUV = kaleidoscope(uv, kalSegments);
  
  // Apply wave distortion
  vec2 distortedUV = waveDistortion(kalUV);
  
  // Main fractal pattern
  float frac = fractal(distortedUV * (0.9 + 0.3 * sin(uTime * 0.2)));
  
  // Create multiple visual layers
  vec3 fractalColor = psychedelicGradient(frac);
  
  // Create light ripples emanating from center
  const int RINGS = 5;
  for (int i = 0; i < RINGS; i++) {
    float speed = 0.3 + float(i) * 0.05;
    float thickness = 0.02 + 0.01 * sin(uTime * 0.2 + float(i));
    float radius = mod(uTime * speed, 2.0);
    
    float ring = smoothstep(thickness, 0.0, abs(r - radius));
    
    // Vary color per ring
    float ringPhase = float(i) / float(RINGS);
    vec3 ringColor = psychedelicGradient(ringPhase);
    
    color += ring * ringColor * 0.2;
  }
  
  // Create ethereal tendrils coming from center
  float tendrilIntensity = 0.0;
  const int TENDRILS = 7;
  for (int i = 0; i < TENDRILS; i++) {
    float angle = float(i) * 2.0 * PI / float(TENDRILS) + uTime * 0.2;
    float curve = sin(theta * 3.0 - uTime + float(i)) * 0.5 + 0.5;
    float tendril = smoothstep(0.1, 0.0, abs(theta - angle) * r);
    tendril *= curve * smoothstep(1.0, 0.0, r);
    tendrilIntensity += tendril;
  }
  
  // Add fractal pattern
  color += fractalColor * (0.7 + 0.5 * sin(r * 10.0 - uTime));
  
  // Add tendrils
  color += psychedelicGradient(tendrilIntensity) * tendrilIntensity * 0.6;
  
  // Add center glow
  color += psychedelicGradient(sin(uTime * 0.2) * 0.5 + 0.5) * exp(-r * 3.0) * 0.8;
  
  // Add outer glow
  color += psychedelicGradient(1.0 - frac) * smoothstep(0.5, 1.5, r) * 0.15;
  
  // Add DNA-like spiral pulsing out from center
  float spiralCount = 3.0;
  float spiralSpeed = uTime * 0.5;
  float spiral = smoothstep(0.03, 0.0, abs(mod(theta * spiralCount + r * 10.0 - spiralSpeed, 2.0 * PI) - PI));
  spiral *= smoothstep(1.0, 0.0, r);
  
  color += psychedelicGradient(r) * spiral * 0.5;
  
  // Final adjustments
  color = pow(color, vec3(0.7)); // Boost intensity
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}