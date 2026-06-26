#version 300 es

precision highp float;

uniform vec2 u_size;
uniform float u_inverse_dpr;
uniform float u_stripe_max_index;
uniform float u_stripe_width;
uniform float u_inverse_stripe_width;
uniform float u_gradient_top;
uniform float u_gradient_vertical_span;
uniform float u_inverse_gradient_denominator;
uniform float u_wave_phase;
uniform float u_secondary_wave_phase;
uniform float u_intro_active;
uniform float u_intro_elapsed;
uniform float u_shine_progress;

uniform vec3 u_start_color;
uniform vec3 u_highlight_delta;
uniform float u_alpha;
uniform float u_intro_alpha;
uniform float u_speed_up_shine_boost;
uniform float u_grain_alpha;
uniform float u_grain_luminance;
uniform float u_grain_contrast;
uniform float u_grain_saturation;

uniform float u_gradient_band_width;
uniform float u_gradient_min_stop;
uniform float u_gradient_max_stop;
uniform float u_intro_reveal_duration;
uniform float u_intro_reveal_duration_inverse;
uniform float u_intro_idle_blend_duration_inverse;
uniform float u_intro_stagger;
uniform float u_intro_center_index;
uniform float u_intro_center_distance;
uniform float u_intro_start_center;
uniform float u_intro_idle_center;
uniform float u_idle_stripe_phase;
uniform float u_idle_secondary_stripe_phase;
uniform float u_idle_primary_amplitude;
uniform float u_idle_secondary_amplitude;

const float GRAIN_SIZE = 180.0;
const vec2 NOISE_HASH_SCALE = vec2(127.1, 311.7);
const float NOISE_HASH_OFFSET = 43758.5;
const mat3x2 NOISE_COLOR_OFFSETS = mat3x2(
    vec2(17.0, 3.0),
    vec2(7.0, 29.0),
    vec2(31.0, 11.0)
);

out vec4 fragment_color;

float clamp01(float value) {
    return clamp(value, 0.0, 1.0);
}

float easeOutCubic(float value) {
    float inverse = 1.0 - value;
    return 1.0 - inverse * inverse * inverse;
}

float introRevealProgress(float delayed_elapsed) {
    if (u_intro_active < 0.5) {
        return 1.0;
    }

    return easeOutCubic(
        clamp01(delayed_elapsed * u_intro_reveal_duration_inverse)
    );
}

float introIdleProgress(float delayed_elapsed) {
    if (u_intro_active < 0.5) {
        return 1.0;
    }

    return easeOutCubic(
        clamp01(
            (delayed_elapsed - u_intro_reveal_duration) *
                u_intro_idle_blend_duration_inverse
        )
    );
}

float hashNoise(vec2 value) {
    return fract(sin(dot(value, NOISE_HASH_SCALE)) * NOISE_HASH_OFFSET);
}

vec3 overlayBlend(vec3 base, vec3 blend) {
    vec3 low = 2.0 * base * blend;
    vec3 high = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);

    return mix(low, high, step(vec3(0.5), base));
}

float gradientHighlightAmount(
    float position,
    float band_start,
    float center,
    float band_end
) {
    if (position < band_start) {
        return 1.0 - clamp01(position / band_start);
    }

    if (position < center) {
        return clamp01((position - band_start) / (center - band_start));
    }

    if (position < band_end) {
        return 1.0 - clamp01((position - center) / (band_end - center));
    }

    return 0.0;
}

void main() {
    vec2 css_position = vec2(
        gl_FragCoord.x * u_inverse_dpr,
        u_size.y - gl_FragCoord.y * u_inverse_dpr
    );
    float stripe_index = min(
        floor(css_position.x * u_inverse_stripe_width),
        u_stripe_max_index
    );
    float stripe_start = stripe_index * u_stripe_width;
    float reveal_delay = max(
        0.0,
        abs(stripe_index - u_intro_center_index) - u_intro_center_distance
    ) * u_intro_stagger;
    float delayed_intro_elapsed = u_intro_elapsed - reveal_delay;
    float reveal_progress = introRevealProgress(delayed_intro_elapsed);
    float idle_progress = introIdleProgress(delayed_intro_elapsed);
    float alpha = u_intro_alpha + (u_alpha - u_intro_alpha) * idle_progress;
    float stripe_phase = stripe_index * u_idle_stripe_phase;
    float secondary_stripe_phase = stripe_index * u_idle_secondary_stripe_phase;
    float primary_wave = sin(u_wave_phase - stripe_phase);
    float secondary_wave = sin(
        u_secondary_wave_phase + secondary_stripe_phase
    );
    float idle_center = 0.5 +
        primary_wave * u_idle_primary_amplitude +
        secondary_wave * u_idle_secondary_amplitude;
    float intro_center = mix(
        u_intro_start_center,
        u_intro_idle_center,
        reveal_progress
    );
    float center = mix(intro_center, idle_center, idle_progress);
    float band_start = clamp(
        center - u_gradient_band_width,
        u_gradient_min_stop,
        u_gradient_max_stop
    );
    float band_end = clamp(
        center + u_gradient_band_width,
        u_gradient_min_stop,
        u_gradient_max_stop
    );
    vec2 gradient_offset = vec2(
        css_position.x - stripe_start,
        css_position.y - u_gradient_top
    );
    vec2 gradient_axis = vec2(
        u_stripe_width,
        u_gradient_vertical_span
    );
    float gradient_position = clamp01(
        dot(gradient_offset, gradient_axis) * u_inverse_gradient_denominator
    );
    vec3 gradient = u_start_color + u_highlight_delta * gradientHighlightAmount(
        gradient_position,
        band_start,
        center,
        band_end
    );
    float gradient_alpha = clamp01(
        alpha * (1.0 + u_shine_progress * u_speed_up_shine_boost)
    ) * reveal_progress;
    float out_alpha = gradient_alpha + alpha * (1.0 - gradient_alpha);
    vec3 color = (
        gradient * gradient_alpha +
        u_start_color * alpha * (1.0 - gradient_alpha)
    ) / max(out_alpha, 0.0001);

    vec2 grain_position = floor(mod(css_position, GRAIN_SIZE));
    float luminance = u_grain_luminance +
        (hashNoise(grain_position) - 0.5) * u_grain_contrast;
    vec3 color_shift = vec3(
        hashNoise(grain_position + NOISE_COLOR_OFFSETS[0]) - 0.5,
        hashNoise(grain_position + NOISE_COLOR_OFFSETS[1]) - 0.5,
        hashNoise(grain_position + NOISE_COLOR_OFFSETS[2]) - 0.5
    ) * u_grain_saturation;
    vec3 grain = clamp((vec3(luminance) + color_shift) / 255.0, 0.0, 1.0);

    color = mix(color, overlayBlend(color, grain), u_grain_alpha);

    fragment_color = vec4(color * out_alpha, out_alpha);
}
