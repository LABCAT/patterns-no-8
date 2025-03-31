precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359

// Mountain silhouette function
float mountain(vec2 uv, float height, float roughness) {
  float value = 0.0;
  float amplitude = height;
  float frequency = 1.0;
  
  for (int i = 0; i < 5; i++) {
    value += amplitude * abs(sin(uv.x * frequency));
    amplitude *= 0.5;
    frequency *= 2.0 + roughness;
  }
  
  return value;
}

// Lotus flower function
float lotus(vec2 uv, vec2 position, float size, float petals) {
  // Move coordinates to lotus position
  vec2 p = (uv - position) / size;
  float angle = atan(p.y, p.x);
  float r = length(p);
  
  // Create petals
  float petalShape = abs(sin(angle * petals));
  petalShape = pow(petalShape, 0.5); // Adjust petal shape
  
  // Animate opening/closing
  float openAmount = 0.5 + 0.5 * sin(uTime * 0.2);
  float flower = smoothstep(0.05 * openAmount, 0.0, abs(r - (0.2 + 0.1 * petalShape)));
  
  // Add center
  float center = smoothstep(0.05, 0.0, r);
  
  return flower + center;
}

// Bamboo function from the previous shader (simplified)
float bamboo(vec2 uv, vec2 pos, float width, float height) {
  float distX = abs(uv.x - pos.x);
  float stalk = smoothstep(width, width - 0.01, distX) * smoothstep(height, 0.0, uv.y - pos.y);
  
  // Add segments
  float segmentCount = 5.0;
  float segmentHeight = height / segmentCount;
  
  const int MAX_SEGMENTS = 8;
  for (int i = 0; i < MAX_SEGMENTS; i++) {
    if(float(i) >= segmentCount) break;
    float nodeY = pos.y + float(i) * segmentHeight;
    float node = smoothstep(0.01, 0.0, abs(uv.y - nodeY)) * smoothstep(width * 1.5, width * 1.5 - 0.01, distX);
    stalk += node * 0.5;
  }
  
  return stalk;
}

// Helper function for rotation
vec2 rotate(vec2 uv, float angle) {
  return vec2(
    uv.x * cos(angle) - uv.y * sin(angle),
    uv.x * sin(angle) + uv.y * cos(angle)
  );
}

// DMT-inspired color palette
vec3 dreamColors(float t) {
  // Base colors
  vec3 jungle = vec3(0.0, 0.5, 0.2);     // Jungle green
  vec3 spiritual = vec3(0.5, 0.0, 0.8);  // Spiritual purple
  vec3 golden = vec3(1.0, 0.84, 0.0);    // Buddha gold
  vec3 sky = vec3(0.0, 0.7, 1.0);        // Buddhist sky blue
  
  // Add pulsing/breathing effect
  float pulse = sin(uTime * 0.3) * 0.5 + 0.5;
  
  // Use color cycling
  t = fract(t + uTime * 0.05);
  
  // Multi-segment gradient
  if (t < 0.25) return mix(jungle, spiritual, t * 4.0) * (1.0 + pulse * 0.2);
  else if (t < 0.5) return mix(spiritual, golden, (t - 0.25) * 4.0) * (1.0 + pulse * 0.2);
  else if (t < 0.75) return mix(golden, sky, (t - 0.5) * 4.0) * (1.0 + pulse * 0.2);
  else return mix(sky, jungle, (t - 0.75) * 4.0) * (1.0 + pulse * 0.2);
}

// Fractal noise for DMT visuals
float fractalNoise(vec2 uv) {
  float value = 0.0;
  float amplitude = 0.5;
  vec2 shift = vec2(100.0);
  
  mat2 rotate = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  
  for (int i = 0; i < 6; i++) {
    value += amplitude * sin(uv.x) * sin(uv.y);
    uv = rotate * uv * 2.0 + shift;
    amplitude *= 0.5;
  }
  
  return value;
}

void main() {
  // Normalize coordinates to center (0,0) with range -1 to 1
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  
  // Adjust for aspect ratio
  float aspectRatio = uResolution.x / uResolution.y;
  uv.x *= aspectRatio;
  
  // Create floating/shifting effect
  uv += vec2(
    sin(uTime * 0.2 + uv.y * 2.0) * 0.02,
    cos(uTime * 0.3 + uv.x * 2.0) * 0.02
  );
  
  // Get polar coordinates
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  
  // Initialize color
  vec3 color = vec3(0.0);
  
  // Add animated sky gradient - transitioning from day to night
  float dayCycle = sin(uTime * 0.1) * 0.5 + 0.5;
  vec3 skyDay = mix(vec3(0.4, 0.7, 1.0), vec3(0.7, 0.4, 0.1), 1.0 - uv.y); // Day: blue to orange
  vec3 skyNight = mix(vec3(0.0, 0.0, 0.2), vec3(0.1, 0.0, 0.3), 1.0 - uv.y); // Night: dark blue to purple
  vec3 skyColor = mix(skyNight, skyDay, dayCycle);
  
  // Add stars at night
  float stars = 0.0;
  if (dayCycle < 0.5) {
    stars = pow(fract(sin(dot(floor(uv * 100.0), vec2(12.9898, 78.233))) * 43758.5453), 20.0);
    stars *= (0.5 - dayCycle) * 2.0; // Only visible at night
  }
  
  // Create DMT-like visual overlay
  float noise = fractalNoise(uv * 3.0 + uTime * 0.1);
  float visualPattern = sin(noise * 10.0 + uTime);
  visualPattern = smoothstep(0.0, 0.1, visualPattern);
  
  // Add color to the sky
  color += skyColor + stars * vec3(1.0);
  color += dreamColors(visualPattern) * visualPattern * 0.2;
  
  // Add distant mountains layers
  for (int i = 0; i < 3; i++) {
    float dist = 0.5 + float(i) * 0.5;
    float mtnHeight = 0.2 - float(i) * 0.05;
    float mtnY = -0.2 - float(i) * 0.1;
    float mtn = mountain(uv * vec2(1.0, 1.0) + vec2(uTime * 0.05 * (float(i) + 1.0), 0.0), mtnHeight, 0.5);
    float mask = smoothstep(0.001, 0.0, uv.y - mtnY + mtn);
    
    vec3 mtnColor = dreamColors(0.2 + float(i) * 0.1) * (0.5 / (float(i) + 1.0));
    color = mix(color, mtnColor, mask);
  }
    
  // Add lotus flowers
  const int LOTUS_COUNT = 5;
  for (int i = 0; i < LOTUS_COUNT; i++) {
    float angle = float(i) * (2.0 * PI / float(LOTUS_COUNT)) + uTime * 0.1;
    float dist = 0.5 + 0.1 * sin(uTime * 0.3 + float(i));
    vec2 lotusPos = vec2(cos(angle), sin(angle) * 0.5) * dist;
    
    float petals = 8.0 + mod(float(i), 3.0) * 2.0;
    float lotusSize = 0.07 + 0.02 * sin(uTime * 0.4 + float(i));
    float lotusShape = lotus(uv, lotusPos, lotusSize, petals);
    
    vec3 lotusColor = dreamColors(float(i) / float(LOTUS_COUNT) + uTime * 0.1);
    color = mix(color, lotusColor, lotusShape * 0.7);
  }
  
  // Add bamboo forest in the foreground
  const int BAMBOO_COUNT = 20;
  for (int i = 0; i < BAMBOO_COUNT; i++) {
    float xPos = mix(-2.0, 2.0, fract(float(i) / float(BAMBOO_COUNT) + sin(float(i) * 0.74) * 0.2));
    float depth = 1.0 - pow(abs(xPos) / 2.0, 2.0); // More bamboo in the center
    
    float bambooHeight = 1.0 + depth * 0.5; 
    float bambooWidth = 0.005 + depth * 0.01;
    float offset = (float(i) * 1234.5) * 0.01;
    float swayAmount = sin(uTime * (0.5 + depth * 0.5) + offset) * 0.1 * depth;
    
    float stalk = bamboo(uv, vec2(xPos + swayAmount, -0.5), bambooWidth, bambooHeight);
    
    vec3 bambooColor = dreamColors(depth * 0.5);
    bambooColor *= 0.5 + depth * 0.5; // Brighter in foreground
    
    // Add DMT-like glow to bamboo
    float glow = exp(-abs(uv.x - xPos) * 10.0) * 0.2 * depth;
    color += bambooColor * stalk + dreamColors(depth + uTime * 0.1) * glow;
  }
  
  // Add spiritual energy emanating from Buddha
  float buddhaAura = exp(-r * 5.0) * (0.5 + 0.5 * sin(uTime));
  color += dreamColors(uTime * 0.2) * buddhaAura;
  
  // Add energy spirals
  const int SPIRAL_COUNT = 3;
  for (int i = 0; i < SPIRAL_COUNT; i++) {
    float spiralSpeed = 0.2 + float(i) * 0.1;
    float spiralTightness = 5.0 + float(i) * 2.0;
    float spiral = fract(r * spiralTightness - uTime * spiralSpeed + float(i) * 1.5);
    spiral = smoothstep(0.4, 0.6, spiral) * 0.2;
    
    color += dreamColors(float(i) / float(SPIRAL_COUNT) + uTime * 0.1) * spiral;
  }
  
  // Add pulsing mandalas
  const int MANDALA_COUNT = 2;
  for (int i = 0; i < MANDALA_COUNT; i++) {
    float mandalaTime = uTime * (0.1 + float(i) * 0.05);
    float mandalaSize = 0.5 + 0.3 * sin(mandalaTime);
    
    // Create rotated UVs for mandala
    vec2 mandalaUV = rotate(uv, mandalaTime * 0.5);
    
    // Create mandala pattern
    float sides = 8.0 + float(i) * 4.0;
    float angle = atan(mandalaUV.y, mandalaUV.x);
    float symmetry = abs(sin(angle * sides + mandalaTime));
    
    float mandala = smoothstep(0.05, 0.0, abs(length(mandalaUV) - mandalaSize * symmetry));
    
    color += dreamColors(mandalaSize + mandalaTime * 0.3) * mandala * 0.3;
  }
  
  // Add incense smoke trails
  const int SMOKE_COUNT = 5;
  for (int i = 0; i < SMOKE_COUNT; i++) {
    float smokeTime = uTime * (0.05 + float(i) * 0.01);
    vec2 smokePos = vec2(mix(-0.2, 0.2, fract(float(i) / float(SMOKE_COUNT))), -0.3);
    
    float smokeWave = sin(uv.y * 10.0 + smokeTime * 10.0 + float(i)) * 0.1;
    float smoke = smoothstep(0.03, 0.0, abs(uv.x - smokePos.x - smokeWave) * (1.0 + (uv.y - smokePos.y) * 5.0));
    smoke *= smoothstep(0.0, 0.5, uv.y - smokePos.y) * smoothstep(1.0, 0.0, uv.y - smokePos.y);
    
    color += mix(vec3(0.8), dreamColors(uv.y + smokeTime), 0.5) * smoke * 0.3;
  }
  
  // Add vignette
  float vignette = smoothstep(1.5, 0.5, r);
  color *= vignette;
  
  // Final color adjustments - add breathing effect to whole scene
  float breathing = 1.0 + 0.1 * sin(uTime * 0.2);
  color *= breathing;
  
  // Add bloom/glow
  color = pow(color, vec3(0.7));
  
  // Output final color
  gl_FragColor = vec4(color, 1.0);
}