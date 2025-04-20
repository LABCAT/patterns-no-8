precision highp float;
uniform vec2 uResolution;
uniform float uTime;

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

// Fractal function - staying closer to original
float fractal(vec2 uv) {
  vec2 z = uv;
  
  // Keep the original parameters with minimal changes
  vec2 c = vec2(0.7885 * sin(uTime * 0.1) - 0.12, 0.6534 * cos(uTime * 0.07) + 0.2);
  float iter = 0.0;
 
  float timeMod = sin(uTime * 0.3) * 0.2;
  z += vec2(cos(uTime * 0.25) * 0.1, sin(uTime * 0.27) * 0.1);
 
  float exponent = 2.3 + sin(uTime * 0.05) * 0.2;
  
  for (int i = 0; i < ITERATIONS; i++) {
    z = complexPow(z, exponent) + c;
    if (length(z) > 4.0) break;
    iter++;
  }
 
  return iter / float(ITERATIONS);
}

// Wave distortion - keeping closer to original
vec2 waveDistortion(vec2 uv) {
  float time = uTime * 0.8;
  float distortX = sin(uv.y * 4.0 + time) * cos(uv.x * 2.0 - time * 0.5) * 0.02;
  float distortY = cos(uv.x * 3.0 + time * 0.7) * sin(uv.y * 2.5 - time * 0.3) * 0.02;
  
  // Add subtle secondary wave
  distortX += sin(uv.y * 6.0 - time * 0.4) * 0.005;
  distortY += cos(uv.x * 5.0 + time * 0.3) * 0.005;
  
  return uv + vec2(distortX, distortY);
}

// Psychedelic gradient - keeping original colors
vec3 psychedelicGradient(float t) {
  vec3 a = vec3(0.5, 0.0, 1.0);
  vec3 b = vec3(1.0, 0.2, 0.8);
  vec3 c = vec3(0.1, 0.9, 1.0);
  vec3 d = vec3(1.0, 0.9, 0.1);
 
  float sinT = sin(uTime * 0.2) * 0.5 + 0.5;
 
  if (t < 0.25) return mix(a, b, t * 4.0) * (1.0 + 0.2 * sinT);
  else if (t < 0.5) return mix(b, c, (t - 0.25) * 4.0) * (1.0 + 0.2 * cos(uTime * 0.3));
  else if (t < 0.75) return mix(c, d, (t - 0.5) * 4.0) * (1.0 + 0.15 * sin(uTime * 0.4));
  else return mix(d, a, (t - 0.75) * 4.0) * (1.0 + 0.25 * cos(uTime * 0.25));
}

// Kaleidoscope - minor enhancement to original
vec2 kaleidoscope(vec2 uv, float segments) {
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);
  float segmentAngle = 2.0 * PI / segments;
  
  float remappedAngle = mod(angle, segmentAngle);
  if (remappedAngle > segmentAngle / 2.0) {
    remappedAngle = segmentAngle - remappedAngle;
  }
  
  return vec2(cos(remappedAngle), sin(remappedAngle)) * radius;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
 
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
 
  // Warp effect - keeping closer to original
  float warpFactor = 0.3 + 0.4 * sin(uTime * 0.1);
  uv = uv / (1.0 - pow(r, 1.5) * warpFactor);
  
  vec3 color = vec3(0.0);
  
  // Kaleidoscope - keeping similar to original
  float kalSegments = 5.0 + floor(sin(uTime * 0.05) * 2.0 + 2.0);
  vec2 kalUV = kaleidoscope(uv, kalSegments + sin(uTime * 0.3) * 1.0);
  
  // Apply wave distortion
  vec2 distortedUV = waveDistortion(kalUV);
  
  // Calculate fractal
  float frac = fractal(distortedUV * (0.9 + 0.3 * sin(uTime * 0.2)));
  vec3 fractalColor = psychedelicGradient(frac);
  
  // Tendrils - keeping close to original
  float tendrilIntensity = 0.0;
  const int TENDRILS = 7;
  for (int i = 0; i < TENDRILS; i++) {
    float angle = float(i) * 2.0 * PI / float(TENDRILS) + uTime * 0.2;
    float curve = sin(theta * 3.0 - uTime + float(i)) * 0.5 + 0.5;
    float tendril = smoothstep(0.1, 0.0, abs(theta - angle) * r);
    tendril *= curve * smoothstep(1.0, 0.0, r);
    tendrilIntensity += tendril;
  }
  
  // Add subtle improvement to the original color blending
  color += fractalColor * (0.7 + 0.5 * sin(r * 10.0 - uTime));
  color += psychedelicGradient(tendrilIntensity) * tendrilIntensity * 0.6;
  
  // Center glow - reduced intensity from previous version
  color += psychedelicGradient(sin(uTime * 0.2) * 0.5 + 0.5) * exp(-r * 3.0) * 0.6;
  
  // Outer glow - keeping close to original
  color += psychedelicGradient(1.0 - frac) * smoothstep(0.5, 1.5, r) * 0.15;
  
  // Spiral - keeping close to original with slight enhancement
  float spiralCount = 3.0;
  float spiralSpeed = uTime * 0.5;
  float spiral = smoothstep(0.03, 0.0, abs(mod(theta * spiralCount + r * 10.0 - spiralSpeed, 2.0 * PI) - PI));
  spiral *= smoothstep(1.0, 0.0, r);
  
  // Add a subtle second spiral for depth
  float spiral2 = smoothstep(0.02, 0.0, abs(mod(-theta * 4.0 + r * 8.0 + spiralSpeed * 0.7, 2.0 * PI) - PI));
  spiral2 *= smoothstep(1.0, 0.2, r) * 0.3; // reduced intensity
  
  color += psychedelicGradient(r) * spiral * 0.5;
  color += psychedelicGradient(1.0 - r) * spiral2 * 0.2;
  
  // Reduce bloom effect by using higher gamma
  color = pow(color, vec3(0.8));
  
  gl_FragColor = vec4(color, 1.0);
}