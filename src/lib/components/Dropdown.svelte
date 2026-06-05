<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue, HTMLSelectAttributes } from "svelte/elements";
    import IconChevronDown from "./icons/IconChevronDown.svelte";

    type DropdownOption = {
        value: string;
        label: string;
        disabled?: boolean;
    };
    type NativeSelectProps = Omit<
        HTMLSelectAttributes,
        "aria-label" | "class" | "id" | "size" | "value"
    >;
    type DropdownContentProps =
        | {
            options: readonly DropdownOption[];
            placeholder?: string;
            children?: never;
        }
        | {
            options?: never;
            placeholder?: string;
            children: Snippet;
        }
        | {
            options?: never;
            placeholder: string;
            children?: never;
        };

    type Props = NativeSelectProps & {
        id: string;
        "aria-label": string;
        class?: ClassValue;
        value?: string;
        width?: string;
        select?: HTMLSelectElement;
    } & DropdownContentProps;

    let {
        id,
        value = $bindable(""),
        width,
        select = $bindable(),
        options = [],
        placeholder,
        children,
        class: className,
        "aria-label": ariaLabel,
        disabled,
        ...rest
    }: Props = $props();
</script>

<label
    class={[
        {
            dropdown: true,
            disabled,
        },
        className,
    ]}
    style:width
>
    <select
        bind:this={select}
        bind:value
        {id}
        class={!value && placeholder ? "placeholder" : undefined}
        aria-label={ariaLabel}
        {disabled}
        {...rest}
    >
        {#if placeholder}
            <option value="" disabled hidden>{placeholder}</option>
        {/if}
        {#if options.length}
            {#each options as option}
                <option value={option.value} disabled={option.disabled}>
                    {option.label}
                </option>
            {/each}
        {:else}
            {@render children?.()}
        {/if}
    </select>
    <span class="dropdown-icon" aria-hidden="true">
        <IconChevronDown />
    </span>
</label>

<style>
    .dropdown {
        --dropdown-padding-inline: 16px;
        --dropdown-icon-size: 18px;
        --dropdown-height: 40px;
        position: relative;
        width: fit-content;
        max-width: 100%;
        min-height: var(--dropdown-height);
        cursor: pointer;
    }

    select {
        cursor: inherit;
        font-size: 16px;
        line-height: 122%;
        min-height: var(--dropdown-height);
        padding-inline: var(--dropdown-padding-inline);
        padding-right: calc(var(--dropdown-padding-inline) + var(--dropdown-icon-size) + 9px);
        user-select: none;
        -webkit-user-select: none;
    }

    select.placeholder {
        color: var(--tertiary);
    }

    .dropdown-icon {
        position: absolute;
        right: var(--dropdown-padding-inline);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--tertiary);
        pointer-events: none;
    }

    .dropdown:focus-within .dropdown-icon {
        color: var(--primary);
    }

    .dropdown-icon :global(svg) {
        width: var(--dropdown-icon-size);
        height: var(--dropdown-icon-size);
        stroke-width: 1.8px;
    }
</style>
