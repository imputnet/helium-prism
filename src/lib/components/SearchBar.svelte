<script lang="ts">
    import type { ClassValue, HTMLInputAttributes } from "svelte/elements";
    import Input from "./Input.svelte";
    import IconSearch from "./icons/IconSearch.svelte";

    type NativeInputProps = Omit<
        HTMLInputAttributes,
        "aria-label" | "class" | "input" | "type" | "value" | "size" | "width"
    >;

    type Props = NativeInputProps & {
        "aria-label": string;
        class?: ClassValue;
        value?: string;
        input?: HTMLInputElement | undefined;
        container?: HTMLDivElement | undefined;
        small?: boolean;
        width?: string;
    };

    let {
        value = $bindable(""),
        input = $bindable(),
        container = $bindable(),
        small = false,
        width,
        class: className = "",
        placeholder,
        "aria-label": ariaLabel,
        ...rest
    }: Props = $props();
</script>

<div
    bind:this={container}
    class="search-bar"
    style:width
    role="search"
>
    <Input
        bind:input
        bind:value
        {small}
        width="100%"
        type="search"
        {placeholder}
        aria-label={ariaLabel}
        class={className}
        {...rest}
    >
        {#snippet leading()}
            <IconSearch />
        {/snippet}
    </Input>
</div>

<style>
    .search-bar {
        width: 100%;
    }

    .search-bar :global(input[type="search"]::-webkit-search-decoration),
    .search-bar :global(input[type="search"]::-webkit-search-cancel-button) {
        -webkit-appearance: none;
    }
</style>
