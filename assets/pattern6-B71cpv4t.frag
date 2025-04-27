precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Grid function for Tron-like environment
float grid(vec2 uv, float size) {
  vec2 g = fract(uv * size);
  return smoothstep(0.02, 0.0, abs(g.x - 0.5)) + smoothstep(0.02, 0.0, abs(g.y - 0.5));
}

// Spiral function
float spiral(vec2 uv, float arms, float thickness, float tightness) {
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Create spiral pattern
  float spiral = fract((theta / (2.0 * PI) + r * tightness + uTime * 0.1) * arms);
  return smoothstep(thickness, 0.0, abs(spiral - 0.5));
}

// Neon glow function
float neonGlow(float value, float intensity) {
  return pow(value, intensity);
}

// Energy pulse function
float energyPulse(vec2 uv, vec2 center, float radius, float thickness) {
  float dist = length(uv - center);
  return smoothstep(thickness, 0.0, abs(dist - radius));
}

// Digital circuit pattern
float circuit(vec2 uv, float scale) {
  vec2 id = floor(uv * scale);
  vec2 gv = fract(uv * scale) * 2.0 - 1.0;
  
  float pattern = 0.0;
  
  // Unique pattern based on cell ID
  float rnd = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
  
  if (rnd < 0.3) {
    // Horizontal line
    pattern = smoothstep(0.05, 0.0, abs(gv.y));
  } else if (rnd < 0.6) {
    // Vertical line
    pattern = smoothstep(0.05, 0.0, abs(gv.x));
  } else {
    // Corner
    float cornerType = fract(rnd * 10.0);
    if (cornerType < 0.25) {
      pattern = smoothstep(0.05, 0.0, max(abs(gv.x - 0.5), abs(gv.y)));
    } else if (cornerType < 0.5) {
      pattern = smoothstep(0.05, 0.0, max(abs(gv.x + 0.5), abs(gv.y)));
    } else if (cornerType < 0.75) {
      pattern = smoothstep(0.05, 0.0, max(abs(gv.x), abs(gv.y - 0.5)));
    } else {
      pattern = smoothstep(0.05, 0.0, max(abs(gv.x), abs(gv.y + 0.5)));
    }
  }
  
  return pattern;
}

// Synthwave sun function
float synthSun(vec2 uv, float size) {
  float dist = length(vec2(uv.x, uv.y - 0.3));
  float sun = smoothstep(size, size - 0.1, dist);
  
  // Add sun rays
  float rays = 0.0;
  for (int i = 0; i < 8; i++) {
    float angle = float(i) * PI / 4.0;
    float ray = smoothstep(0.05, 0.0, abs(atan(uv.y - 0.3, uv.x) - angle));
    rays += ray * smoothstep(size + 0.5, size, dist) * abs(sin(uTime * 0.5 + float(i)));
  }
  
  return sun + rays * 0.3;
}

// Psychedelic color palette
vec3 synthwaveColor(float t) {
  // Synthwave/retro palette
  vec3 purple = vec3(0.5, 0.0, 1.0);   // Purple
  vec3 pink = vec3(1.0, 0.0, 0.8);     // Hot pink
  vec3 blue = vec3(0.0, 0.8, 1.0);     // Cyan blue
  vec3 yellow = vec3(1.0, 0.9, 0.0);   // Yellow
  
  // Add pulsing/breathing effect
  float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
  
  // Multi-segment gradient
  if (t < 0.33) return mix(purple, pink, t * 3.0) * (1.0 + pulse * 0.2);
  else if (t < 0.66) return mix(pink, blue, (t - 0.33) * 3.0) * (1.0 + pulse * 0.2);
  else return mix(blue, yellow, (t - 0.66) * 3.0) * (1.0 + pulse * 0.2);
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  float aspectRatio = uResolution.x / uResolution.y;
  uv.x *= aspectRatio;
  
  // Create zooming effect
  float zoom = sin(uTime * 0.2) * 0.5 + 1.5;
  uv *= zoom;
  
  // Add rotation for disorientation
  float rotationSpeed = uTime * 0.1;
  vec2 rotatedUV = vec2(
    uv.x * cos(rotationSpeed) - uv.y * sin(rotationSpeed),
    uv.x * sin(rotationSpeed) + uv.y * cos(rotationSpeed)
  );
  
  // Create perspective distortion
  vec2 perspectiveUV = uv;
  perspectiveUV.y /= 0.5 + abs(perspectiveUV.x) * 0.5;
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Add synthwave grid with perspective
  float gridPattern = grid(perspectiveUV + vec2(0.0, uTime * 0.5), 10.0);
  vec3 gridColor = synthwaveColor(abs(perspectiveUV.y * 0.5) + 0.2);
  color += gridColor * gridPattern * 0.5;
  
  // Add multiple spiral layers
  const int SPIRAL_LAYERS = 3;
  for (int i = 0; i < SPIRAL_LAYERS; i++) {
    float armCount = 3.0 + float(i) * 2.0;
    float thickness = 0.2 - float(i) * 0.05;
    float tightness = 0.5 + float(i) * 0.2;
    
    // Different rotation for each spiral
    float spiralRot = uTime * (0.1 + float(i) * 0.05);
    vec2 spiralUV = vec2(
      uv.x * cos(spiralRot) - uv.y * sin(spiralRot),
      uv.x * sin(spiralRot) + uv.y * cos(spiralRot)
    );
    
    float spiralPattern = spiral(spiralUV, armCount, thickness, tightness);
    vec3 spiralColor = synthwaveColor(float(i) / float(SPIRAL_LAYERS) + uTime * 0.1);
    
    // Add glow effect
    float glow = neonGlow(spiralPattern, 1.5);
    color += spiralColor * glow * 0.6;
  }
  
  // Add pulsing energy rings
  const int RING_COUNT = 4;
  for (int i = 0; i < RING_COUNT; i++) {
    float ringPhase = float(i) * PI / float(RING_COUNT);
    float ringRadius = 0.2 + 1.5 * abs(sin(uTime * 0.3 + ringPhase));
    float ringThickness = 0.05 + 0.03 * sin(uTime * 0.5 + float(i));
    
    float ring = energyPulse(rotatedUV, vec2(0.0, 0.0), ringRadius, ringThickness);
    vec3 ringColor = synthwaveColor(float(i) / float(RING_COUNT) + sin(uTime * 0.2) * 0.2);
    
    color += ringColor * ring * 0.5;
  }
  
  // Add digital circuit patterns in background
  float circuitPattern = circuit(uv * 0.5, 5.0);
  color += synthwaveColor(circuitPattern + uTime * 0.05) * circuitPattern * 0.3;
  
  // Add synthwave sun
  float sun = synthSun(uv, 0.3);
  vec3 sunColor = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.0, 0.5), sin(uTime * 0.3) * 0.5 + 0.5);
  color += sunColor * sun * 0.7;
  
  // Add flying light tracers (Tron light cycles)
  const int TRACERS = 5;
  for (int i = 0; i < TRACERS; i++) {
    float tracerPhase = float(i) * (2.0 * PI / float(TRACERS));
    float tracerSpeed = 0.3 + float(i) * 0.1;
    
    // Create path for tracer
    float tracerTime = uTime * tracerSpeed + tracerPhase;
    vec2 tracerPos = vec2(
      sin(tracerTime) * 1.0 + cos(tracerTime * 0.7) * 0.3,
      cos(tracerTime) * 0.5 + sin(tracerTime * 1.3) * 0.4
    );
    
    // Create trailing effect
    float trailLength = 0.2 + 0.1 * sin(uTime * 0.5 + float(i));
    for (int j = 0; j < 10; j++) {
      float trailTime = tracerTime - float(j) * 0.03;
      vec2 trailPos = vec2(
        sin(trailTime) * 1.0 + cos(trailTime * 0.7) * 0.3,
        cos(trailTime) * 0.5 + sin(trailTime * 1.3) * 0.4
      );
      
      float trail = smoothstep(0.03 - float(j) * 0.002, 0.0, length(uv - trailPos));
      vec3 trailColor = synthwaveColor(float(i) / float(TRACERS));
      
      color += trailColor * trail * (1.0 - float(j) * 0.08);
    }
    
    // Create the tracer point
    float tracer = smoothstep(0.03, 0.0, length(uv - tracerPos));
    vec3 tracerColor = synthwaveColor(float(i) / float(TRACERS));
    
    color += tracerColor * tracer * 1.5;
  }
  
  // Add digital glitch effect
  float glitchIntensity = 0.15 * pow(sin(uTime * 15.0) * 0.5 + 0.5, 10.0);
  float glitchLine = step(0.98, fract(uv.y * 50.0 + uTime * 5.0));
  color = mix(color, vec3(1.0) - color, glitchLine * glitchIntensity);
  
  // Add chromatic aberration
  float aberration = 0.01 * sin(uTime * 0.5);
  vec3 colorShift = vec3(0.0);
  colorShift.r = length(uv + vec2(aberration, 0.0));
  colorShift.g = length(uv);
  colorShift.b = length(uv - vec2(aberration, 0.0));
  color += 0.05 * colorShift;
  
  // Add scanlines for retro CRT effect
  float scanline = sin(gl_FragCoord.y * 0.5 - uTime * 10.0) * 0.5 + 0.5;
  color *= 0.9 + 0.1 * scanline;
  
  // Add bloom/glow
  color = pow(color, vec3(0.8));
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}