#version 300 es

precision highp float;

uniform vec2 u_size;
uniform float u_inverse_dpr;
uniform float u_stripe_width;
uniform float u_gradient_top;
uniform float u_gradient_vertical_span;
uniform float u_inverse_gradient_denominator;

uniform vec3 u_start_color;
uniform vec3 u_highlight_delta;
uniform float u_grain_alpha;
uniform float u_grain_luminance;
uniform float u_grain_contrast;
uniform float u_grain_saturation;
uniform sampler2D u_grain_noise;

flat in float v_stripe_start;
flat in vec3 v_band;
flat in vec3 v_band_inverse;
flat in float v_out_alpha;
flat in float v_highlight_strength;

const float GRAIN_SIZE = 180.0;

out vec4 fragment_color;

float clamp01(float value) {
    return clamp(value, 0.0, 1.0);
}

vec3 overlayBlend(vec3 base, vec3 blend) {
    vec3 low = 2.0 * base * blend;
    vec3 high = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);

    return mix(low, high, step(vec3(0.5), base));
}

float gradientHighlightAmount(float position) {
    if (position < v_band.x) {
        return 1.0 - clamp01(position * v_band_inverse.x);
    }

    if (position < v_band.y) {
        return clamp01((position - v_band.x) * v_band_inverse.y);
    }

    if (position < v_band.z) {
        return 1.0 - clamp01((position - v_band.y) * v_band_inverse.z);
    }

    return 0.0;
}

void main() {
    vec2 css_position = vec2(
        gl_FragCoord.x * u_inverse_dpr,
        u_size.y - gl_FragCoord.y * u_inverse_dpr
    );
    vec2 gradient_offset = vec2(
        css_position.x - v_stripe_start,
        css_position.y - u_gradient_top
    );
    vec2 gradient_axis = vec2(
        u_stripe_width,
        u_gradient_vertical_span
    );
    float gradient_position = clamp01(
        dot(gradient_offset, gradient_axis) * u_inverse_gradient_denominator
    );
    vec3 color = u_start_color + u_highlight_delta * (
        gradientHighlightAmount(gradient_position) * v_highlight_strength
    );

    ivec2 grain_position = min(
        ivec2(mod(css_position, GRAIN_SIZE)),
        ivec2(GRAIN_SIZE - 1.0)
    );
    vec4 noise = texelFetch(u_grain_noise, grain_position, 0) - 0.5;
    float luminance = u_grain_luminance + noise.r * u_grain_contrast;
    vec3 color_shift = noise.gba * u_grain_saturation;
    vec3 grain = clamp((vec3(luminance) + color_shift) / 255.0, 0.0, 1.0);

    color = mix(color, overlayBlend(color, grain), u_grain_alpha);

    fragment_color = vec4(color * v_out_alpha, v_out_alpha);
}
