<script lang="ts">
    import { onMount } from "svelte";
    import type { ClassValue } from "svelte/elements";
    import * as Shimmer from "../gradient-shimmer";

    type Props = {
        intro?: boolean;
        background?: boolean;
        class?: ClassValue;
    };

    let {
        intro: shouldIntro,
        background,
        class: className,
    }: Props = $props();

    let canvas: HTMLCanvasElement;
    let shimmerController: Shimmer.GradientShimmerControls | null = null;
    let visible = $state(false);

    export function intro() {
        shimmerController?.intro();
    }

    export function emphasize() {
        shimmerController?.emphasize();
    }

    onMount(() => {
        const renderer = Shimmer.createGradientShimmerRenderer(canvas);

        if (!renderer) {
            return;
        }

        const colorSchemeQuery = window.matchMedia(
            "(prefers-color-scheme: dark)",
        );
        const reducedMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        let animationFrame: number | null = null;
        let resizeFrame: number | null = null;
        let introAnimation: Shimmer.IntroAnimation | null = null;
        let speedUpAnimation: Shimmer.WaveSpeedUpAnimation | null = null;
        let wavePhase = Shimmer.getRandomWavePhase();
        let secondaryWavePhase = -wavePhase * 0.7;
        let lastFrameTime: number | null = null;

        const cancelResizeFrame = () => {
            if (resizeFrame === null) {
                return;
            }

            cancelAnimationFrame(resizeFrame);
            resizeFrame = null;
        };

        const cancelAnimation = () => {
            if (animationFrame === null) {
                return;
            }

            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        };

        const drawFrame = (time: number) => {
            const reducedMotion = reducedMotionQuery.matches;
            const deltaSeconds = reducedMotion || lastFrameTime === null
                ? 0
                : Math.min((time - lastFrameTime) / 1000, 0.064);
            const speedUpState = Shimmer.updateSpeedUpAnimation(
                time,
                speedUpAnimation,
            );
            const activeIntroAnimation = reducedMotion ? null : introAnimation;

            lastFrameTime = reducedMotion ? null : time;
            speedUpAnimation = reducedMotion ? null : speedUpState.animation;

            if (!reducedMotion) {
                wavePhase += Shimmer.IDLE_WAVE.speed
                    * speedUpState.multiplier
                    * deltaSeconds;
                secondaryWavePhase += Shimmer.IDLE_WAVE.secondarySpeed
                    * speedUpState.multiplier
                    * deltaSeconds;
            }

            renderer.render({
                time,
                wavePhase,
                secondaryWavePhase,
                introStartedAt: activeIntroAnimation?.startedAt ?? null,
                shineProgress: reducedMotion ? 0 : speedUpState.shineProgress,
            });

            if (
                Shimmer.isIntroComplete(
                    time,
                    introAnimation,
                    renderer.getStripeCount(),
                )
            ) {
                introAnimation = null;
            }
        };

        const startIntro = () => {
            if (reducedMotionQuery.matches) {
                introAnimation = null;
                drawFrame(performance.now());
                return;
            }

            introAnimation = { startedAt: performance.now() };
        };

        const startWaveSpeedUp = () => {
            if (reducedMotionQuery.matches) {
                speedUpAnimation = null;
                drawFrame(performance.now());
                return;
            }

            const time = performance.now();

            speedUpAnimation = Shimmer.triggerSpeedUpAnimation(
                time,
                speedUpAnimation,
            );
        };

        const controller: Shimmer.GradientShimmerControls = {
            intro: startIntro,
            emphasize: startWaveSpeedUp,
        };

        const applyResize = () => {
            renderer.resize();
            renderer.readColors();
        };

        const scheduleResize = () => {
            cancelResizeFrame();
            resizeFrame = requestAnimationFrame((time) => {
                applyResize();
                drawFrame(time);
            });
        };

        const draw = (time: number) => {
            animationFrame = null;
            drawFrame(time);

            if (!reducedMotionQuery.matches) {
                animationFrame = requestAnimationFrame(draw);
            }
        };

        const requestAnimation = () => {
            if (animationFrame !== null || reducedMotionQuery.matches) {
                return;
            }

            animationFrame = requestAnimationFrame(draw);
        };

        applyResize();

        if (shouldIntro !== false) {
            startIntro();
        }

        // Delay the reveal until after the first WebGL frame has been painted.
        drawFrame(performance.now());
        requestAnimationFrame(() => {
            visible = true;
        });
        shimmerController = controller;

        const resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(canvas);

        const scheduleColorRead = () => {
            cancelResizeFrame();
            resizeFrame = requestAnimationFrame((time) => {
                renderer.readColors();
                drawFrame(time);
            });
        };

        const themeObserver = new MutationObserver(scheduleColorRead);
        themeObserver.observe(document.documentElement, { attributes: true });

        const updateMotionPreference = () => {
            if (reducedMotionQuery.matches) {
                introAnimation = null;
                speedUpAnimation = null;
                cancelAnimation();
                drawFrame(performance.now());
                return;
            }

            lastFrameTime = null;
            requestAnimation();
        };

        colorSchemeQuery.addEventListener("change", scheduleColorRead);
        reducedMotionQuery.addEventListener("change", updateMotionPreference);

        updateMotionPreference();

        return () => {
            if (shimmerController === controller) {
                shimmerController = null;
            }

            visible = false;
            cancelAnimation();
            cancelResizeFrame();
            resizeObserver.disconnect();
            themeObserver.disconnect();
            colorSchemeQuery.removeEventListener("change", scheduleColorRead);
            reducedMotionQuery.removeEventListener("change", updateMotionPreference);
            renderer.dispose();
        };
    });
</script>

<canvas
    bind:this={canvas}
    class={[background && "background", visible && "visible", className]}
    aria-hidden="true"
></canvas>

<style>
    canvas {
        --shimmer-alpha: 0.35;
        --shimmer-grain-alpha: 0.15;
        --shimmer-grain-luminance: 220;
        --shimmer-grain-contrast: 34;
        --shimmer-grain-saturation: 8;
        --shimmer-intro-alpha: 0.6;
        --shimmer-speed-up-shine-boost: 0.3;
        --shimmer-highlight: var(--bg-gradient-end);
        --shimmer-start: var(--bg-gradient-start);

        display: block;
        z-index: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
    }

    canvas.visible {
        opacity: 1;
    }

    canvas.background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }

    @media (prefers-color-scheme: dark) {
        canvas {
            --shimmer-alpha: 0.7;
            --shimmer-grain-alpha: 0.15;
            --shimmer-grain-luminance: 144;
            --shimmer-grain-contrast: 64;
            --shimmer-grain-saturation: 32;
            --shimmer-intro-alpha: 1;
            --shimmer-speed-up-shine-boost: 0.15;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        canvas {
            transition-duration: 1ms;
        }
    }
</style>
