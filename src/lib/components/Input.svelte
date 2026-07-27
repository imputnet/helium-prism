<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue, HTMLInputAttributes } from "svelte/elements";

    type NativeInputProps = Omit<
        HTMLInputAttributes,
        "aria-label" | "class" | "input" | "size" | "value" | "width"
    >;

    type Props = NativeInputProps & {
        "aria-label": string;
        class?: ClassValue;
        value?: HTMLInputAttributes["value"];
        small?: boolean;
        width?: string;
        input?: HTMLInputElement | undefined;
        leading?: Snippet;
        trailing?: Snippet;
    };

    let {
        value = $bindable(),
        small = false,
        width,
        input = $bindable(),
        leading,
        trailing,
        class: className,
        placeholder,
        "aria-label": ariaLabel,
        disabled,
        ...rest
    }: Props = $props();
</script>

<label
    class={[
        {
            "input-field": true,
            small,
            disabled,
        },
        className,
    ]}
    style:width
>
    {#if leading}
        <span class="input-accessory" aria-hidden="true">
            {@render leading()}
        </span>
    {/if}
    <input
        bind:this={input}
        bind:value
        {placeholder}
        aria-label={ariaLabel}
        {disabled}
        {...rest}
    />
    {#if trailing}
        <span class="input-accessory" aria-hidden="true">
            {@render trailing()}
        </span>
    {/if}
</label>

<style>
    .input-field {
        --input-font-size: 16px;
        --input-icon-size: 18px;
        --input-line-height: 122%;
        --input-padding: 13px 16px;

        padding: var(--input-padding);
        min-height: 46px;
    }

    .small {
        --input-font-size: 14px;
        --input-icon-size: 16px;
        --input-line-height: 120%;
        --input-padding: 10px 16px;

        min-height: 38px;
    }

    input {
        font-size: var(--input-font-size);
        line-height: var(--input-line-height);
        padding: 0;

        &[type="number"] {
            appearance: textfield;
            -moz-appearance: textfield;
        }

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }

    .input-accessory {
        color: var(--tertiary);
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .input-field:focus-within .input-accessory {
        color: var(--primary);
    }

    .input-accessory :global(svg) {
        width: var(--input-icon-size);
        height: var(--input-icon-size);
        stroke-width: 1.8px;
    }
</style>
