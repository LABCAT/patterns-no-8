precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

float flower(vec2 uv, float petals, float radius) {
  float angle = atan(uv.y, uv.x);
  float len = length(uv);
  
  // Create flowing trails effect
  float flow = 0.2 * sin(len * 12.0 - uTime * 0.5);
  angle += flow;
  
  // Organic petal shape with flow
  float amplitude = pow(sin(angle * petals) * 0.5 + 0.5, 1.2) * 
                    (0.9 + 0.1 * sin(angle * petals * 2.0));
  
  // Add thin trailing lines
  float trails = smoothstep(0.03, 0.0, abs(sin(angle * petals * 3.0 + len * 15.0 - uTime * 0.3)));
  trails *= smoothstep(1.0, 0.4, len) * 0.3;
  
  float shape = 1.0 - smoothstep(radius * amplitude, radius * amplitude + 0.01, len);
  return shape + trails;
}

float circle(vec2 uv, float radius) {
  return 1.0 - smoothstep(radius - 0.01, radius, length(uv));
}

vec2 rotate(vec2 uv, float angle) {
  return vec2(
    uv.x * cos(angle) - uv.y * sin(angle),
    uv.x * sin(angle) + uv.y * cos(angle)
  );
}

// Replace your layerColor definition with this gradient
vec3 getColorFromGradient(float t) {
  vec3 center = vec3(0.9, 1.0, 1.0);
  vec3 middle = vec3(0.1, 0.6, 1.0);
  vec3 outer = vec3(0.8, 0.2, 0.9);
  vec3 edge = vec3(1.0, 0.5, 0.1);
  
  if(t < 0.3) return mix(center, middle, t/0.3);
  else if(t < 0.6) return mix(middle, outer, (t-0.3)/0.3);
  else return mix(outer, edge, (t-0.6)/0.4);
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Create multiple rotating layers
  vec3 color = vec3(0.0);
  
  // Center glow
  float centerGlow = exp(-r * 1.0) * 0.05;
  color += vec3(0.9, 0.6, 0.9) * centerGlow;
  
  // Multiple flower layers with different rotations and colors
  const int LAYERS = 6;
  for (int i = 0; i < LAYERS; i++) {
    float scale = 1.0 - float(i) * 0.15;
    float rotSpeed = float(i + 1) * 0.1;
    vec2 rotUV = rotate(uv, uTime * rotSpeed);
    
    // Create flower pattern with varying petal counts
    float petals = float(i * 4 + 8);
    float pulseRate = 0.3 + float(i) * 0.1;
    float sizePulse = .7 + 0.3 * sin(uTime * pulseRate);
    float flowerPattern = flower(rotUV * scale, petals, sizePulse);
    
    // Create different color for each layer
    vec3 layerColor = getColorFromGradient(float(i) / float(LAYERS-1));
    
    float phase = float(i) * 0.5; // Different phases
    float basePulseRadius = 0.2 + float(i) * 0.15; // Base position
    float maxGrowth = 1.2; // Much larger growth factor
    float growingRadius = basePulseRadius + maxGrowth * sin(uTime * 0.4 + phase);
    float ringEffect = smoothstep(0.02, 0.0, abs(r - growingRadius));
    
    // Add to final color
    color += layerColor * flowerPattern * 0.3 + layerColor * ringEffect * 0.5;
  }
  
  // Add symmetrical kaleidoscope effect
  float symmetry = 12.0;
  float symTheta = mod(theta, 2.0 * PI / symmetry) - PI / symmetry;
  vec2 symUV = vec2(cos(symTheta), sin(symTheta)) * r;
  
  // Add detailed patterns
  float detailPattern = sin(symUV.x * 30.0 + uTime) * sin(symUV.y * 30.0 + uTime) * 0.5 + 0.5;
  detailPattern *= smoothstep(0.4, 0.6, r) * smoothstep(1.0, 0.8, r); // Only in mid-range
  
  // Add ornamental lines at specific angles
  float angelicLines = 0.0;
  for (int i = 0; i < 6; i++) {
    float lineAngle = float(i) * PI / 6.0 + uTime * 0.1;
    float line = smoothstep(0.03, 0.0, abs(mod(theta - lineAngle, 2.0 * PI) - PI));
    angelicLines += line * (0.5 + 0.5 * sin(r * 20.0 + uTime));
  }
  
  // Add more vibrant colors for details
  vec3 detailColor = vec3(
    0.7 + 0.3 * sin(uTime * 0.1),
    0.5 + 0.5 * sin(uTime * 0.1 + 2.0),
    0.9
  );
  
  // Combine all elements
  color += detailColor * detailPattern * 0.3 + vec3(1.0, 0.8, 0.2) * angelicLines * 0.2;
  
  // Ring that grows outward and then back inward
    float oscillatingSize = abs(sin(uTime * 0.3)) * 0.9; // Oscillates between 0-0.9
    float pingPongRing = smoothstep(0.05, 0.0, abs(r - oscillatingSize));
    color += vec3(0.9, 0.4, 0.8) * pingPongRing;
  
    color = pow(color, vec3(0.8));
    // Output the final color
  gl_FragColor = vec4(color, 1.0);
}