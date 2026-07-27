<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue, HTMLInputAttributes } from "svelte/elements";
    import IconCheck from "./icons/IconCheck.svelte";

    type CheckboxLabelProps =
        | {
            children: Snippet;
            "aria-label"?: string;
            "aria-labelledby"?: string;
        }
        | {
            children?: never;
            "aria-label": string;
            "aria-labelledby"?: string;
        }
        | {
            children?: never;
            "aria-label"?: string;
            "aria-labelledby": string;
        };

    type Props = Omit<HTMLInputAttributes, "class" | "type" | "checked"> & {
        class?: ClassValue;
        checked?: boolean;
    } & CheckboxLabelProps;

    let {
        checked = $bindable(false),
        children,
        class: className,
        disabled,
        ...rest
    }: Props = $props();

    let previousChecked = $state(checked);
    let toggling = $state(false);

    $effect(() => {
        if (checked === previousChecked) {
            return;
        }

        previousChecked = checked;
        toggling = true;

        requestAnimationFrame(() => {
            toggling = false;
        });
    });
</script>

<label
    class={[
        {
            checkbox: true,
            disabled,
            toggling,
        },
        className,
    ]}
>
    <input type="checkbox" bind:checked {disabled} {...rest} />
    <span class="checkbox-control" aria-hidden="true">
        <IconCheck />
    </span>
    {#if children}
        <span class="checkbox-content">
            {@render children()}
        </span>
    {/if}
</label>

<style>
    .checkbox {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        color: var(--primary);
        cursor: pointer;
        line-height: 120%;
        user-select: none;
        -webkit-user-select: none;
    }

    input {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .checkbox-control {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        border-radius: 100%;
        background-color: var(--helium-elevated-7);
        box-shadow: 0 0 0 1.5px var(--helium-elevated-5) inset;
        transition: background-color 0.2s, transform 0.2s;
        will-change: transform;

        & :global(svg) {
            width: 21px;
            height: 21px;
            stroke-width: 2px;
            opacity: 0;
        }
    }

    .toggling .checkbox-control {
        transition: transform 0.2s;
    }

    @media (hover: hover) {
        .checkbox:hover input:not(:checked) + .checkbox-control {
            background-color: var(--helium-elevated-10);
        }

        .checkbox:hover input:checked + .checkbox-control {
            background-color: var(--helium-blue-hover);
        }
    }

    .checkbox:active .checkbox-control {
        transform: scale(0.97);
    }

    input:checked + .checkbox-control {
        background-color: var(--helium-blue);
        color: #ffffff;

        & :global(svg) {
            opacity: 1;
        }
    }

    input:focus-visible + .checkbox-control {
        outline: 2px var(--primary) solid;
        outline-offset: 3px;
    }

    .checkbox-content {
        color: var(--secondary);
        font-size: 16px;
        line-height: 122%;
    }

    .disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
</style>
