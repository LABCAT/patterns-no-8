precision highp float;

// Uniforms passed from p5.js
uniform vec2 uResolution;  // Canvas size
uniform float uTime;       // Time in seconds

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Simplified noise function - better performance
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Simplified perlinNoise - reduces computation
float perlinNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Smoother step instead of cubic for better performance
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // Mix 4 corner samples
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Simplified FBM with fewer octaves
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    
    // Reduced from 6 to 3 octaves
    for (int i = 0; i < 3; i++) {
        value += amplitude * perlinNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

// Optimized psychedelic spiral function
float psychedelicSpiral(vec2 uv, float arms, float thickness, float tightness, float phase) {
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
    
    // Simplified distortion
    float distortion = fbm(uv * 1.5 + uTime * 0.1) * 0.2;
    
    // Create spiral pattern with temporal warping
    float spiral = fract((theta / TWO_PI + r * tightness + phase + distortion) * arms);
    
    // Simplified thickness variation
    float thicknessVar = thickness * (0.8 + 0.2 * sin(r * 5.0 + uTime));
    
    return smoothstep(thicknessVar, 0.0, abs(spiral - 0.5));
}

// Optimized morphing circle function
vec3 morphingCircle(vec2 uv, vec2 center, float radius, float morphSpeed, float spiralDensity) {
    // Distance from center
    float dist = length(uv - center);
    
    // Basic circle shape with faster smoothstep
    float circle = smoothstep(radius + 0.05, radius - 0.05, dist);
    
    // Add spiral patterns that morph over time
    vec2 localUV = (uv - center) / radius;
    float spiralPattern = 0.0;
    
    // Reduced from 3 to 2 spiral layers
    for (int i = 0; i < 2; i++) {
        float i_float = float(i);
        float arms = spiralDensity + i_float * 2.0;
        float phase = uTime * morphSpeed * (0.2 + i_float * 0.1);
        float tightness = 2.0 + sin(uTime * 0.2 + i_float) * 0.5;
        
        spiralPattern += psychedelicSpiral(localUV, arms, 0.15, tightness, phase) * 0.3;
    }
    
    // Simplified color calculation
    vec3 baseColor = vec3(
        0.5 + 0.5 * sin(uTime * 0.2 + center.x * 3.0),
        0.5 + 0.5 * sin(uTime * 0.3 + center.y * 3.0),
        0.5 + 0.5 * sin(uTime * 0.4 + length(center) * 3.0)
    );
    
    // Simplified rainbow ripples
    float rainbowRipple = sin(dist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
    vec3 rippleColor = vec3(
        0.5 + 0.5 * sin(rainbowRipple * 4.0 + 0.0),
        0.5 + 0.5 * sin(rainbowRipple * 4.0 + 2.0),
        0.5 + 0.5 * sin(rainbowRipple * 4.0 + 4.0)
    );
    
    // Apply spiral pattern and circle mask
    return mix(baseColor, rippleColor, 0.5) * (circle * (0.7 + spiralPattern * 1.0));
}

// Simplified wizard color function
vec3 wizardColor(float t) {
    t = fract(t);
    
    // Pre-calculate colors to avoid branching
    vec3 emeraldGreen = vec3(0.0, 0.8, 0.2);
    vec3 rubyRed = vec3(1.0, 0.0, 0.3);
    vec3 yellowBrickRoad = vec3(1.0, 0.8, 0.0);
    vec3 magicPurple = vec3(0.8, 0.0, 1.0);
    vec3 sapphireBlue = vec3(0.0, 0.3, 1.0);
    
    vec3 color1 = mix(emeraldGreen, rubyRed, clamp(t * 5.0, 0.0, 1.0));
    vec3 color2 = mix(rubyRed, yellowBrickRoad, clamp((t - 0.2) * 5.0, 0.0, 1.0));
    vec3 color3 = mix(yellowBrickRoad, magicPurple, clamp((t - 0.4) * 5.0, 0.0, 1.0));
    vec3 color4 = mix(magicPurple, sapphireBlue, clamp((t - 0.6) * 5.0, 0.0, 1.0));
    vec3 color5 = mix(sapphireBlue, emeraldGreen, clamp((t - 0.8) * 5.0, 0.0, 1.0));
    
    // Use step functions instead of if statements
    return color1 * step(0.0, t) * step(t, 0.2) +
           color2 * step(0.2, t) * step(t, 0.4) +
           color3 * step(0.4, t) * step(t, 0.6) +
           color4 * step(0.6, t) * step(t, 0.8) +
           color5 * step(0.8, t);
}

void main() {
    // Normalized coordinates
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;
    
    // Simplified zoom effect
    float zoom = 1.0 + 0.2 * sin(uTime * 0.15);
    uv *= zoom;
    
    // Simplified swirling distortion
    float swirl = 0.3 * sin(uTime * 0.1);
    float dist = length(uv);
    float angle = atan(uv.y, uv.x) + swirl * dist;
    vec2 distortedUV = vec2(cos(angle), sin(angle)) * dist;
    
    // Initialize color
    vec3 color = vec3(0.0);
    
    const int NUM_CIRCLES = 8;
    for (int i = 0; i < NUM_CIRCLES; i++) {
        float i_float = float(i);
        float angle = i_float * TWO_PI / float(NUM_CIRCLES);
        
        // Simplified movement pattern
        float radius = 0.2 + 0.05 * sin(uTime * 0.2 + i_float);
        float xOffset = radius * 3.0 * cos(angle + uTime * 0.1);
        float yOffset = radius * 3.0 * sin(angle + uTime * 0.1);
        
        vec2 center = vec2(xOffset, yOffset);
        
        // Simplified parameters
        float morphSpeed = 0.2 + i_float * 0.04;
        float spiralDensity = 3.0 + i_float * 0.4;
        
        // Add this circle's contribution
        color += morphingCircle(distortedUV, center, radius, morphSpeed, spiralDensity);
    }
    
    // Add minimal background color without expensive fractal
    vec3 backgroundColor = wizardColor(uTime * 0.1) * 0.2;
    color = mix(backgroundColor, color, min(1.0, length(color)));
    
    // Simplified edge enhancement - removed expensive calculations
    vec2 edgeUV = gl_FragCoord.xy / uResolution.xy;
    float edgeGlow = (1.0 - edgeUV.x) * edgeUV.x * (1.0 - edgeUV.y) * edgeUV.y * 4.0;
    color += wizardColor(uTime * 0.1) * edgeGlow * 0.2;
    
    // Output final color (removed expensive post-processing)
    gl_FragColor = vec4(min(color, 1.0), 1.0);
}