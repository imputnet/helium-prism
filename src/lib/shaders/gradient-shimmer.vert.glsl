#version 300 es

precision highp float;

// X is 0 at the stripe's left edge and 1 at its right edge, Y is in clip space.
in vec2 position;

uniform vec2 u_size;
uniform float u_stripe_max_index;
uniform float u_stripe_width;
uniform float u_wave_phase;
uniform float u_secondary_wave_phase;
uniform float u_intro_active;
uniform float u_intro_elapsed;
uniform float u_shine_progress;

uniform float u_alpha;
uniform float u_intro_alpha;
uniform float u_speed_up_shine_boost;

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

// Everything below is constant across a stripe, so it's computed per stripe
// instead of per pixel.
flat out float v_stripe_start;
// Band start, center and band end.
flat out vec3 v_band;
// Inverse lengths of the three gradient segments.
flat out vec3 v_band_inverse;
flat out float v_out_alpha;
flat out float v_highlight_strength;

const float EPSILON = 0.0001;

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

void main() {
    float stripe_index = float(gl_InstanceID);
    float stripe_start = stripe_index * u_stripe_width;
    float edge_x = (stripe_index + position.x) * u_stripe_width;

    // Avoid a gap at the right edge from float error.
    if (stripe_index == u_stripe_max_index && position.x > 0.5) {
        edge_x = u_size.x;
    }

    gl_Position = vec4(edge_x / u_size.x * 2.0 - 1.0, position.y, 0.0, 1.0);

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
    float gradient_alpha = clamp01(
        alpha * (1.0 + u_shine_progress * u_speed_up_shine_boost)
    ) * reveal_progress;
    float out_alpha = gradient_alpha + alpha * (1.0 - gradient_alpha);

    v_stripe_start = stripe_start;
    v_band = vec3(band_start, center, band_end);
    v_band_inverse = 1.0 / max(
        vec3(band_start, center - band_start, band_end - center),
        EPSILON
    );
    v_out_alpha = out_alpha;
    // Compositing the gradient over the start color reduces to
    // start + delta * amount * gradient_alpha / out_alpha.
    v_highlight_strength = gradient_alpha / max(out_alpha, EPSILON);
}
