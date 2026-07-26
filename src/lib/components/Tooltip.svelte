<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        anchor: Snippet;
        content: Snippet;
        id?: string;
    };

    const generatedId = $props.id();
    let { anchor, content, id = generatedId }: Props = $props();

    let anchorElement: HTMLDivElement;
    let popover: HTMLDivElement;

    let tooltipX = $state(0);
    let tooltipY = $state(0);

    let visible = $state(false);

    const offsetY = 12;
    const offsetX = 16;

    const updatePosition = (e: MouseEvent) => {
        tooltipX = e.clientX - offsetX;
        tooltipY = e.clientY - offsetY;
    };

    const updatePositionFromAnchor = () => {
        const rect = anchorElement.getBoundingClientRect();

        tooltipX = rect.left;
        tooltipY = rect.bottom - offsetY;
    };

    $effect(() => {
        if (!popover) return;

        if (visible) {
            popover.showPopover();
        } else {
            popover.hidePopover();
        }
    });
</script>

<div
    bind:this={anchorElement}
    class="tooltip-anchor"
    onpointermove={updatePosition}
    onpointerenter={() => (visible = true)}
    onpointerleave={() => (visible = false)}
    onfocusin={() => {
        if (!visible) updatePositionFromAnchor();
        visible = true;
    }}
    onfocusout={() => (visible = false)}
    role="group"
    aria-describedby={id}
>
    {@render anchor()}
</div>

<div
    bind:this={popover}
    popover="manual"
    class="tooltip-container"
    role="tooltip"
    {id}
    style:left="{tooltipX}px"
    style:top="{tooltipY}px"
>
    <div class="tooltip-content">
        {@render content()}
    </div>
</div>

<style>
    .tooltip-anchor {
        display: flex;
        position: relative;
        width: fit-content;
        height: fit-content;
        gap: var(--gap-1);
    }

    .tooltip-container {
        position: fixed;
        margin: 0;
        padding: 16px;
        border: none;
        background: none;
        pointer-events: none;

        opacity: 0;
        transform: scale(0.8);
        transform-origin: left;
        transition: transform 0.15s, opacity 0.15s;
    }

    .tooltip-container:popover-open {
        opacity: 1;
        transform: none;
        transform-origin: top left;
    }

    @starting-style {
        .tooltip-container:popover-open {
            opacity: 0;
            transform: scale(0.8);
        }
    }

    .tooltip-content {
        color: var(--primary);
        background-color: var(--tooltip-bg);
        outline: 1.5px solid var(--helium-elevated-10);
        outline-offset: -1.5px;

        text-wrap: pretty;
        padding: 10px 12px;
        font-size: 14px;
        white-space: pre;
        line-height: 120%;

        border-radius: 12px;
        border-top-left-radius: 4px;
        box-shadow: 4px 4px 10px 0 var(--tooltip-shadow);
    }
</style>
