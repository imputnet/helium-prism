<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    type Variant =
        | "display"
        | "title"
        | "heading"
        | "subheading"
        | "body"
        | "caption";
    type Tone = "primary" | "secondary" | "tertiary" | "white";
    type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

    type BaseProps = {
        children: Snippet;
        tone?: Tone;
        center?: boolean;
        class?: ClassValue;
    };
    type VariantProps = BaseProps & {
        variant?: Variant;
        tag?: never;
    };
    type TagProps = BaseProps & {
        tag: Tag;
        variant?: never;
    };
    type Props = VariantProps | TagProps;

    const defaultTag = (variant: Variant): Tag => {
        if (variant === "display") return "h1";
        if (variant === "title") return "h2";
        if (variant === "heading") return "h3";
        if (variant === "subheading") return "h4";
        return "p";
    };

    let {
        children,
        variant = "body",
        tone,
        tag,
        center = false,
        class: className,
    }: Props = $props();

    let element = $derived(tag ?? defaultTag(variant));
</script>

<svelte:element
    this={element}
    class={["text", tone && `tone-${tone}`, center && "center", className]}
>
    {@render children()}
</svelte:element>

<style>
    .text {
        margin: 0;
    }

    .center {
        text-align: center;
    }

    .tone-primary {
        color: var(--primary);
    }

    .tone-secondary {
        color: var(--secondary);
    }

    .tone-tertiary {
        color: var(--tertiary);
    }

    .tone-white {
        color: var(--white);
    }
</style>
