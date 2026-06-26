import { Mesh, Program, Renderer, Triangle } from "ogl";
import FRAGMENT_SHADER_SOURCE from "./shaders/gradient-shimmer.frag.glsl?raw";
import VERTEX_SHADER_SOURCE from "./shaders/gradient-shimmer.vert.glsl?raw";

const STRIPE_WIDTH = {
    min: 64,
    target: 110,
    max: 120,
};

const GRADIENT = {
    bandWidth: 0.48,
    minStop: 0.14,
    maxStop: 0.96,
};

const INTRO = {
    delay: 700,
    revealDuration: 840,
    idleBlendDuration: 500,
    stagger: 45,
    startCenter: 0.96,
    idleCenter: 0.5,
};

const WAVE_SPEED_UP = {
    multiplier: 2.15,
    rampUpDuration: 140,
    waveDuration: 320,
    rampDownDuration: 480,
};

export const IDLE_WAVE = {
    speed: 0.42,
    stripePhase: 0.74,
    secondarySpeed: 0.26,
    secondaryStripePhase: 1.28,
    primaryAmplitude: 0.19,
    secondaryAmplitude: 0.055,
};

const FULL_CIRCLE = Math.PI * 2;

export type IntroAnimation = {
    startedAt: number;
};

type WaveSpeedUpValues = {
    multiplier: number;
    shineProgress: number;
};

export type WaveSpeedUpAnimation = {
    phase: "ramp-up";
    startedAt: number;
    duration: number;
    from: WaveSpeedUpValues;
} | {
    phase: "hold";
    startedAt: number;
} | {
    phase: "ramp-down";
    startedAt: number;
    from: WaveSpeedUpValues;
};

type Size = {
    width: number;
    height: number;
    dpr: number;
};

export type GradientShimmerControls = {
    intro: () => void;
    emphasize: () => void;
};

type WaveSpeedUpAnimationState = WaveSpeedUpValues & {
    animation: WaveSpeedUpAnimation | null;
};

type Color = [number, number, number];

type ShaderColors = {
    alpha: number;
    grainAlpha: number;
    grainLuminance: number;
    grainContrast: number;
    grainSaturation: number;
    introAlpha: number;
    start: Color;
    highlightDelta: Color;
    speedUpShineBoost: number;
};

type StripeMetrics = {
    count: number;
    width: number;
    inverseWidth: number;
    maxIndex: number;
    introCenterIndex: number;
    introCenterDistance: number;
};

type RenderMetrics = {
    inverseDpr: number;
    gradientTop: number;
    gradientVerticalSpan: number;
    inverseGradientDenominator: number;
};

type GradientShimmerRenderer = {
    resize: () => void;
    readColors: () => void;
    render: (frame: {
        time: number;
        wavePhase: number;
        secondaryWavePhase: number;
        introStartedAt: number | null;
        shineProgress: number;
    }) => void;
    dispose: () => void;
    getStripeCount: () => number;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value: number) => (
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
);

export const getRandomWavePhase = () => Math.random() * FULL_CIRCLE;

const readCssNumber = (
    styles: CSSStyleDeclaration,
    name: string,
) => {
    const rawValue = styles.getPropertyValue(name).trim();
    const value = Number(rawValue);

    if (!rawValue || !Number.isFinite(value)) {
        throw new Error(`Missing or invalid CSS number: ${name}`);
    }

    return value;
};

const readCssString = (
    styles: CSSStyleDeclaration,
    name: string,
) => {
    const value = styles.getPropertyValue(name).trim();

    if (!value) {
        throw new Error(`Missing CSS value: ${name}`);
    }

    return value;
};

const getStripeCount = (canvasWidth: number) => {
    const minCount = Math.max(1, Math.ceil(canvasWidth / STRIPE_WIDTH.max));
    const maxCount = Math.max(1, Math.floor(canvasWidth / STRIPE_WIDTH.min));
    const targetCount = Math.max(
        1,
        Math.round(canvasWidth / STRIPE_WIDTH.target),
    );

    return Math.max(minCount, Math.min(maxCount, targetCount));
};

const getStripeMetrics = (width: number): StripeMetrics => {
    const count = getStripeCount(width);
    const stripeWidth = width / count;
    const maxIndex = count - 1;

    return {
        count,
        width: stripeWidth,
        inverseWidth: 1 / stripeWidth,
        maxIndex,
        introCenterIndex: maxIndex / 2,
        introCenterDistance: count % 2 === 0 ? 0.5 : 0,
    };
};

const getRenderMetrics = (
    size: Size,
    stripes: StripeMetrics,
): RenderMetrics => {
    const gradientVerticalSpan = size.height * 1.7;

    return {
        inverseDpr: 1 / size.dpr,
        gradientTop: size.height * -0.35,
        gradientVerticalSpan,
        inverseGradientDenominator: 1 / (
            stripes.width * stripes.width
            + gradientVerticalSpan * gradientVerticalSpan
        ),
    };
};

const getRevealDelay = (
    index: number,
    stripeCount: number,
    stagger = INTRO.stagger,
) => {
    const centerIndex = (stripeCount - 1) / 2;
    const centerDistance = stripeCount % 2 === 0 ? 0.5 : 0;
    const distanceFromCenter = Math.abs(index - centerIndex) - centerDistance;

    return Math.max(0, distanceFromCenter) * stagger;
};

const getMaxRevealDelay = (stripeCount: number, stagger = INTRO.stagger) => {
    if (stripeCount <= 0) {
        return 0;
    }

    return Math.max(
        getRevealDelay(0, stripeCount, stagger),
        getRevealDelay(stripeCount - 1, stripeCount, stagger),
    );
};

export const isIntroComplete = (
    time: number,
    introAnimation: IntroAnimation | null,
    stripeCount: number,
) => {
    if (!introAnimation) {
        return true;
    }

    const completeAt = introAnimation.startedAt
        + INTRO.delay
        + getMaxRevealDelay(stripeCount)
        + INTRO.revealDuration
        + INTRO.idleBlendDuration;

    return time >= completeAt;
};

const createShaderUniforms = () => ({
    u_size: { value: [1, 1] },
    u_inverse_dpr: { value: 1 },
    u_stripe_max_index: { value: 0 },
    u_stripe_width: { value: 1 },
    u_inverse_stripe_width: { value: 1 },
    u_gradient_top: { value: 0 },
    u_gradient_vertical_span: { value: 1 },
    u_inverse_gradient_denominator: { value: 1 },
    u_wave_phase: { value: 0 },
    u_secondary_wave_phase: { value: 0 },
    u_intro_active: { value: 0 },
    u_intro_elapsed: { value: 0 },
    u_shine_progress: { value: 0 },
    u_start_color: { value: [0, 0, 0] },
    u_highlight_delta: { value: [0, 0, 0] },
    u_alpha: { value: 1 },
    u_intro_alpha: { value: 1 },
    u_speed_up_shine_boost: { value: 0 },
    u_grain_alpha: { value: 0 },
    u_grain_luminance: { value: 0 },
    u_grain_contrast: { value: 0 },
    u_grain_saturation: { value: 0 },
    u_intro_center_index: { value: 0 },
    u_intro_center_distance: { value: 0 },
    u_gradient_band_width: { value: GRADIENT.bandWidth },
    u_gradient_min_stop: { value: GRADIENT.minStop },
    u_gradient_max_stop: { value: GRADIENT.maxStop },
    u_intro_reveal_duration: { value: INTRO.revealDuration },
    u_intro_reveal_duration_inverse: { value: 1 / INTRO.revealDuration },
    u_intro_idle_blend_duration_inverse: { value: 1 / INTRO.idleBlendDuration },
    u_intro_stagger: { value: INTRO.stagger },
    u_intro_start_center: { value: INTRO.startCenter },
    u_intro_idle_center: { value: INTRO.idleCenter },
    u_idle_stripe_phase: { value: IDLE_WAVE.stripePhase },
    u_idle_secondary_stripe_phase: { value: IDLE_WAVE.secondaryStripePhase },
    u_idle_primary_amplitude: { value: IDLE_WAVE.primaryAmplitude },
    u_idle_secondary_amplitude: { value: IDLE_WAVE.secondaryAmplitude },
});

const parseColorChannel = (channel: string) => {
    if (channel.endsWith("%")) {
        return clamp(Number.parseFloat(channel) / 100);
    }

    return clamp(Number.parseFloat(channel) / 255);
};

const parseCssColorValue = (value: string): Color => {
    const color = value.trim().toLowerCase();

    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const normalized = hex.length === 3
            ? hex.split("").map((part) => part + part).join("")
            : hex;

        if (normalized.length === 6) {
            return [
                Number.parseInt(normalized.slice(0, 2), 16) / 255,
                Number.parseInt(normalized.slice(2, 4), 16) / 255,
                Number.parseInt(normalized.slice(4, 6), 16) / 255,
            ];
        }
    }

    const channels = color.match(/-?\d*\.?\d+(?:e[+-]?\d+)?%?/g) ?? [];

    if (color.startsWith("color(") && channels.length >= 3) {
        const [red, green, blue] = channels as [string, string, string];

        return [
            clamp(Number.parseFloat(red)),
            clamp(Number.parseFloat(green)),
            clamp(Number.parseFloat(blue)),
        ];
    }

    if (channels.length >= 3) {
        const [red, green, blue] = channels as [string, string, string];

        return [
            parseColorChannel(red),
            parseColorChannel(green),
            parseColorChannel(blue),
        ];
    }

    throw new Error(`Unsupported CSS color: ${value}`);
};

const readCssColor = (
    styles: CSSStyleDeclaration,
    name: string,
    context: CanvasRenderingContext2D,
) => {
    const rawValue = readCssString(styles, name);

    context.fillStyle = "#000000";
    context.fillStyle = rawValue;

    return parseCssColorValue(context.fillStyle);
};

const readShaderColors = (
    canvas: HTMLCanvasElement,
    colorContext: CanvasRenderingContext2D,
): ShaderColors => {
    const styles = getComputedStyle(canvas);
    const start = readCssColor(styles, "--shimmer-start", colorContext);
    const highlight = readCssColor(styles, "--shimmer-highlight", colorContext);

    return {
        alpha: readCssNumber(styles, "--shimmer-alpha"),
        grainAlpha: readCssNumber(styles, "--shimmer-grain-alpha"),
        grainLuminance: readCssNumber(styles, "--shimmer-grain-luminance"),
        grainContrast: readCssNumber(styles, "--shimmer-grain-contrast"),
        grainSaturation: readCssNumber(styles, "--shimmer-grain-saturation"),
        introAlpha: readCssNumber(styles, "--shimmer-intro-alpha"),
        start,
        highlightDelta: [
            highlight[0] - start[0],
            highlight[1] - start[1],
            highlight[2] - start[2],
        ],
        speedUpShineBoost: readCssNumber(
            styles,
            "--shimmer-speed-up-shine-boost",
        ),
    };
};

const getCanvasSize = (canvas: HTMLCanvasElement): Size => {
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;
    const cssWidth = Math.max(1, width);
    const cssHeight = Math.max(1, height);

    return { width: cssWidth, height: cssHeight, dpr };
};

const resizeOglCanvas = (
    canvas: HTMLCanvasElement,
    renderer: Renderer,
): Size => {
    const size = getCanvasSize(canvas);

    renderer.dpr = size.dpr;
    renderer.setSize(size.width, size.height);
    canvas.style.width = "";
    canvas.style.height = "";

    return size;
};

export const createGradientShimmerRenderer = (
    canvas: HTMLCanvasElement,
): GradientShimmerRenderer | null => {
    const initialSize = getCanvasSize(canvas);
    let renderer: Renderer;

    try {
        renderer = new Renderer({
            canvas,
            width: initialSize.width,
            height: initialSize.height,
            dpr: initialSize.dpr,
            alpha: true,
            antialias: false,
            autoClear: false,
            depth: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            stencil: false,
            webgl: 2,
        });
    } catch {
        return null;
    }

    const { gl } = renderer;

    if (!gl || !renderer.isWebgl2) {
        return null;
    }

    canvas.style.width = "";
    canvas.style.height = "";
    gl.clearColor(0, 0, 0, 0);

    const colorCanvas = document.createElement("canvas");
    const colorContext = colorCanvas.getContext("2d");

    if (!colorContext) {
        return null;
    }

    const uniforms = createShaderUniforms();
    let program: Program | null = null;
    let geometry: Triangle | null = null;
    let mesh: Mesh | null = null;
    let initialColors: ShaderColors | null = null;

    try {
        program = new Program(gl, {
            vertex: VERTEX_SHADER_SOURCE,
            fragment: FRAGMENT_SHADER_SOURCE,
            uniforms,
            cullFace: false,
            depthTest: false,
            depthWrite: false,
            transparent: false,
        });
        geometry = new Triangle(gl);
        mesh = new Mesh(gl, {
            geometry,
            program,
            frustumCulled: false,
        });
        initialColors = readShaderColors(canvas, colorContext);
    } catch {
        geometry?.remove();
        program?.remove();
        return null;
    }

    if (!program || !geometry || !mesh || !initialColors) {
        return null;
    }

    let size = initialSize;
    let stripes = getStripeMetrics(size.width);
    let renderMetrics = getRenderMetrics(size, stripes);
    let colors = initialColors;

    const resize = () => {
        size = resizeOglCanvas(canvas, renderer);
        stripes = getStripeMetrics(size.width);
        renderMetrics = getRenderMetrics(size, stripes);
    };

    const readColors = () => {
        colors = readShaderColors(canvas, colorContext);
    };

    return {
        resize,
        readColors,
        render: ({
            time,
            wavePhase,
            secondaryWavePhase,
            introStartedAt,
            shineProgress,
        }) => {
            uniforms.u_size.value = [size.width, size.height];
            uniforms.u_inverse_dpr.value = renderMetrics.inverseDpr;
            uniforms.u_stripe_max_index.value = stripes.maxIndex;
            uniforms.u_stripe_width.value = stripes.width;
            uniforms.u_inverse_stripe_width.value = stripes.inverseWidth;
            uniforms.u_gradient_top.value = renderMetrics.gradientTop;
            uniforms.u_gradient_vertical_span.value = renderMetrics.gradientVerticalSpan;
            uniforms.u_inverse_gradient_denominator.value =
                renderMetrics.inverseGradientDenominator;
            uniforms.u_wave_phase.value = wavePhase;
            uniforms.u_secondary_wave_phase.value = secondaryWavePhase;
            uniforms.u_intro_active.value = introStartedAt === null ? 0 : 1;
            uniforms.u_intro_elapsed.value = introStartedAt === null
                ? 0
                : time - introStartedAt - INTRO.delay;
            uniforms.u_shine_progress.value = shineProgress;
            uniforms.u_intro_center_index.value = stripes.introCenterIndex;
            uniforms.u_intro_center_distance.value = stripes.introCenterDistance;
            uniforms.u_start_color.value = colors.start;
            uniforms.u_highlight_delta.value = colors.highlightDelta;
            uniforms.u_alpha.value = colors.alpha;
            uniforms.u_intro_alpha.value = colors.introAlpha;
            uniforms.u_speed_up_shine_boost.value = colors.speedUpShineBoost;
            uniforms.u_grain_alpha.value = colors.grainAlpha;
            uniforms.u_grain_luminance.value = colors.grainLuminance;
            uniforms.u_grain_contrast.value = colors.grainContrast;
            uniforms.u_grain_saturation.value = colors.grainSaturation;

            renderer.render({
                scene: mesh,
                clear: true,
                frustumCull: false,
                sort: false,
                update: false,
            });
        },
        dispose: () => {
            geometry.remove();
            program.remove();
        },
        getStripeCount: () => stripes.count,
    };
};

const IDLE_SPEED_UP: WaveSpeedUpValues = {
    multiplier: 1,
    shineProgress: 0,
};

const PEAK_SPEED_UP: WaveSpeedUpValues = {
    multiplier: WAVE_SPEED_UP.multiplier,
    shineProgress: 1,
};

const lerpSpeedUpValues = (
    from: WaveSpeedUpValues,
    to: WaveSpeedUpValues,
    progress: number,
): WaveSpeedUpValues => ({
    multiplier: lerp(from.multiplier, to.multiplier, progress),
    shineProgress: lerp(from.shineProgress, to.shineProgress, progress),
});

const getProgress = (time: number, startedAt: number, duration: number) =>
    clamp((time - startedAt) / duration);

const getSpeedUpRampUpDuration = (from: WaveSpeedUpValues) => {
    const multiplierRemaining = clamp(
        (WAVE_SPEED_UP.multiplier - from.multiplier)
            / (WAVE_SPEED_UP.multiplier - 1),
    );
    const shineRemaining = 1 - from.shineProgress;

    return Math.max(
        1,
        WAVE_SPEED_UP.rampUpDuration
            * Math.max(multiplierRemaining, shineRemaining),
    );
};

const isSpeedUpAtPeak = ({ multiplier, shineProgress }: WaveSpeedUpValues) =>
    multiplier >= WAVE_SPEED_UP.multiplier && shineProgress >= 1;

export const triggerSpeedUpAnimation = (
    time: number,
    speedUpAnimation: WaveSpeedUpAnimation | null,
): WaveSpeedUpAnimation => {
    const { multiplier, shineProgress } = updateSpeedUpAnimation(
        time,
        speedUpAnimation,
    );
    const from = { multiplier, shineProgress };

    if (isSpeedUpAtPeak(from)) {
        return {
            phase: "hold",
            startedAt: time,
        };
    }

    return {
        phase: "ramp-up",
        startedAt: time,
        duration: getSpeedUpRampUpDuration(from),
        from,
    };
};

export const updateSpeedUpAnimation = (
    time: number,
    speedUpAnimation: WaveSpeedUpAnimation | null,
): WaveSpeedUpAnimationState => {
    if (!speedUpAnimation) {
        return {
            animation: null,
            ...IDLE_SPEED_UP,
        };
    }

    if (speedUpAnimation.phase === "ramp-up") {
        const progress = getProgress(
            time,
            speedUpAnimation.startedAt,
            speedUpAnimation.duration,
        );
        const values = lerpSpeedUpValues(
            speedUpAnimation.from,
            PEAK_SPEED_UP,
            easeOutCubic(progress),
        );

        if (progress >= 1) {
            return {
                animation: {
                    phase: "hold",
                    startedAt: time,
                },
                ...values,
            };
        }

        return {
            animation: speedUpAnimation,
            ...values,
        };
    }

    if (speedUpAnimation.phase === "hold") {
        const progress = getProgress(
            time,
            speedUpAnimation.startedAt,
            WAVE_SPEED_UP.waveDuration,
        );

        if (progress >= 1) {
            return {
                animation: {
                    phase: "ramp-down",
                    startedAt: time,
                    from: PEAK_SPEED_UP,
                },
                ...PEAK_SPEED_UP,
            };
        }

        return {
            animation: speedUpAnimation,
            ...PEAK_SPEED_UP,
        };
    }

    const progress = getProgress(
        time,
        speedUpAnimation.startedAt,
        WAVE_SPEED_UP.rampDownDuration,
    );
    const values = lerpSpeedUpValues(
        speedUpAnimation.from,
        IDLE_SPEED_UP,
        easeInOutCubic(progress),
    );

    return {
        animation: progress >= 1 ? null : speedUpAnimation,
        ...values,
    };
};
