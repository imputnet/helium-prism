<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue, HTMLButtonAttributes } from "svelte/elements";

    type ToggleContentProps =
        | {
            children: Snippet;
            name?: never;
            desc?: never;
        }
        | {
            children?: never;
            name: string;
            desc?: string;
        };

    type Props = Omit<HTMLButtonAttributes, "aria-checked" | "class" | "onchange"> & {
        class?: ClassValue;
        checked?: boolean;
        onchange?: (checked: boolean) => void;
    } & ToggleContentProps;
    type ButtonClickEvent = Parameters<NonNullable<HTMLButtonAttributes["onclick"]>>[0];

    let {
        checked = $bindable(false),
        name,
        desc,
        children,
        onchange,
        class: className,
        type = "button",
        disabled,
        onclick,
        ...rest
    }: Props = $props();

    const toggle = (event: ButtonClickEvent) => {
        onclick?.(event);

        if (event.defaultPrevented || disabled) {
            return;
        }

        checked = !checked;
        onchange?.(checked);
    };
</script>

<button
    class={["toggle-button card", className]}
    {disabled}
    {type}
    role="switch"
    aria-checked={checked}
    onclick={toggle}
    {...rest}
>
    <div class="toggle-text">
        {#if children}
            {@render children()}
        {:else}
            {#if name}
                <h4>{name}</h4>
            {/if}
            {#if desc}
                <p>{desc}</p>
            {/if}
        {/if}
    </div>
    <div class={["toggle", checked && "enabled"]} aria-hidden="true">
        <div class="runner"></div>
    </div>
</button>

<style>
    .toggle-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        overflow: hidden;
    }

    .toggle {
        min-width: 48px;
        width: 48px;
        height: 28px;
        border-radius: 50px;
        background-color: var(--helium-elevated-30);
        transition: background-color 0.25s, opacity 0.2s;

        & .runner {
            width: 22px;
            height: 22px;
            margin: 3px;
            background-color: var(--white);
            border-radius: 50px;
            will-change: translate;
            transition: translate 0.15s;
        }

        &.enabled {
            background-color: var(--helium-blue);

            & .runner {
                translate: 20px 0;
            }
        }
    }
</style>
