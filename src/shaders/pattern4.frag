precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Folding space function inspired by tesseracts
float hyperFold(vec2 uv, float intensity) {
  vec2 q = vec2(
    sin(uv.x * 3.0 + uTime * 0.2) * cos(uv.y * 2.0 - uTime * 0.3),
    cos(uv.x * 2.5 - uTime * 0.1) * sin(uv.y * 3.5 + uTime * 0.4)
  );
  
  vec2 r = vec2(
    sin(q.x * 2.0 + uTime * 0.4) * cos(q.y * 3.0 - uTime * 0.5),
    cos(q.x * 3.0 - uTime * 0.6) * sin(q.y * 2.0 + uTime * 0.3)
  );
  
  return mix(length(q), length(r), sin(uTime * 0.2) * 0.5 + 0.5) * intensity;
}

// Dimensional rift effect
float dimensionalRift(vec2 uv, float frequency) {
  // Create a circular mask
  float dist = length(uv);
  float circle = smoothstep(2.5, 0.2, dist);
  
  // Create multi-layered noise pattern
  float pattern = 0.0;
  
  // Layered noise
  pattern += sin(uv.x * frequency + uTime) * sin(uv.y * frequency + uTime) * 0.5;
  pattern += sin(uv.x * frequency * 2.3 + uTime * 1.1) * sin(uv.y * frequency * 2.1 - uTime * 0.7) * 0.25;
  pattern += sin(uv.x * frequency * 3.7 - uTime * 0.5) * sin(uv.y * frequency * 3.9 + uTime * 0.8) * 0.125;
  
  // Warp based on distance from center
  pattern *= 1.0 - dist * dist * 0.5;
  
  return pattern * circle;
}

// Time-warped rotation
vec2 timeWarpRotate(vec2 uv, float intensity) {
  float angle = uTime * intensity * (0.5 + 0.5 * sin(uTime * 0.1));
  
  return vec2(
    uv.x * cos(angle) - uv.y * sin(angle),
    uv.x * sin(angle) + uv.y * cos(angle)
  );
}

// Time-elastic distortion
vec2 elasticDistortion(vec2 uv) {
  float timeScale = uTime * 0.3;
  
  float elasticX = sin(uv.y * 3.0 + timeScale) * 0.03;
  float elasticY = cos(uv.x * 2.5 + timeScale * 1.2) * 0.03;
  
  return uv + vec2(elasticX, elasticY);
}

// Alien color palette inspired by higher dimensions
vec3 alienGradient(float t) {
  // Base colors from "impossible" color space
  vec3 a = vec3(0.0, 0.2, 0.5);    // Deep space blue
  vec3 b = vec3(0.8, 0.0, 0.8);    // Interdimensional purple
  vec3 c = vec3(0.0, 0.8, 0.5);    // Quantum teal
  vec3 d = vec3(1.0, 0.4, 0.0);    // Hyperspace orange
  
  // Time modulators
  float mod1 = 0.1 * sin(uTime * 0.3);
  float mod2 = 0.1 * cos(uTime * 0.24);
  float mod3 = 0.1 * sin(uTime * 0.17);
  
  a += vec3(mod1, mod2, mod3);
  b += vec3(mod3, mod1, mod2);
  c += vec3(mod2, mod3, mod1);
  d += vec3(mod1, mod3, mod2);
  
  // Multi-segment gradient
  if (t < 0.33) return mix(a, b, t * 3.0);
  else if (t < 0.66) return mix(b, c, (t - 0.33) * 3.0);
  else return mix(c, d, (t - 0.66) * 3.0);
}

// Event horizon rings
float eventHorizon(float dist, float thickness) {
  float pulseSpeed = uTime * 0.4;
  float waveHeight = 0.05 * sin(dist * 20.0 - pulseSpeed * 2.0);
  
  return smoothstep(thickness, 0.0, abs(dist - (1.3 + waveHeight)));
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  uv.x *= uResolution.x / uResolution.y;


    // Add this line here
    uv *= 0.7; // Scale down UV to make everything larger
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Add cosmic distortion
  float distortionScale = 0.3 + 0.2 * sin(uTime * 0.1);
  vec2 distortUV = elasticDistortion(uv);
  
  // Create a sense of falling through dimensions
  float warpStrength = 1.5 + sin(uTime * 0.2) * 0.5;
  vec2 warpedUV = uv / (1.0 - r * r * warpStrength * 0.3);
  
  // Rotate through higher dimensions
  vec2 rotatedUV = timeWarpRotate(warpedUV, 0.2);
  
  // Initialize colors
  vec3 color = vec3(0.0);
  
  // Apply hyperdimensional fold
  float hyperEffect = hyperFold(rotatedUV, 0.7);
  
  // Create dimensional rift
  float rift = dimensionalRift(distortUV, 15.0);
  
  // Create event horizon rings
  float ring1 = eventHorizon(r, 0.03);
  float ring2 = eventHorizon(r * 1.3, 0.02);
  float ring3 = eventHorizon(r * 0.7, 0.01);
  
  // Create tesseract-like portals
  const int PORTALS = 4;
  for (int i = 0; i < PORTALS; i++) {
    float angle = float(i) * (2.0 * PI / float(PORTALS)) + uTime * 0.1;
    float dist = 0.4 + 0.1 * sin(uTime * 0.3 + float(i));
    vec2 portalPos = vec2(cos(angle), sin(angle)) * dist;
    
    float portalStrength = smoothstep(0.25, 0.0, length(uv - portalPos));
    float portalTime = uTime * (0.5 + float(i) * 0.1);
    float portalRift = dimensionalRift((uv - portalPos) * 2.0, 20.0 + float(i) * 5.0);
    
    color += alienGradient(float(i) / float(PORTALS) + portalTime * 0.1) * portalStrength * portalRift * 2.0;
  }
  
  // Add main rift
  vec3 riftColor = alienGradient(hyperEffect + uTime * 0.05);
  color += riftColor * rift * 1.5;
  
  // Add rings with alien colors
  color += alienGradient(0.1 + sin(uTime * 0.2) * 0.1) * ring1 * 0.7;
  color += alienGradient(0.5 + sin(uTime * 0.3) * 0.1) * ring2 * 0.7;
  color += alienGradient(0.8 + sin(uTime * 0.15) * 0.1) * ring3 * 0.7;
  
  // Add center wormhole effect
  float wormhole = smoothstep(0.8, 0.0, r);
  float wormholePattern = fract(r * 10.0 - uTime * 0.5);
  wormholePattern = smoothstep(0.4, 0.6, wormholePattern);
  
  color += alienGradient(wormholePattern) * wormhole * wormholePattern * 0.5;
  
  // Add cosmic center
  float centerGlow = exp(-r * 3.0);
  color += alienGradient(uTime * 0.1) * centerGlow * 0.8;
  
  // Add interdimensional beings floating in the space (abstract floating shapes)
  const int ENTITIES = 5;
  for (int i = 0; i < ENTITIES; i++) {
    float entityTime = uTime * (0.2 + float(i) * 0.03);
    float entityAngle = entityTime + float(i) * PI / 3.0;
    float entityDist = 0.3 + 0.2 * sin(entityTime * 0.7);
    vec2 entityPos = vec2(cos(entityAngle), sin(entityAngle)) * entityDist;
    
    // Create abstract entity shape
    float entity = smoothstep(0.06, 0.02, length(uv - entityPos));
    
    // Add some "tentacles" or energy trails
    for (int j = 0; j < 3; j++) {
      float trailAngle = entityAngle + float(j) * 2.0 * PI / 3.0 + sin(entityTime) * 0.5;
      float trailLength = 0.1 + 0.05 * sin(entityTime * 1.2 + float(j));
      vec2 trailPos = entityPos + vec2(cos(trailAngle), sin(trailAngle)) * trailLength;
      
      float trail = smoothstep(0.03, 0.0, length(uv - trailPos));
      entity += trail * 0.3;
    }
    
    color += alienGradient(float(i) / float(ENTITIES) + entityTime * 0.1) * entity * 0.4;
  }
  
  // Final color adjustment
  color = pow(color, vec3(0.6)); // Increase brightness 
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}