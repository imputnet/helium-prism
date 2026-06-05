<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue, HTMLAnchorAttributes } from "svelte/elements";

    type Props = Omit<HTMLAnchorAttributes, "class" | "href"> & {
        href: string;
        class?: ClassValue;
        children: Snippet;
    };

    let {
        href,
        children,
        class: className,
        target: targetProp,
        rel: relProp,
        ...rest
    }: Props = $props();
    let url = $derived(new URL(href, document.location.href));
    let isLocalHref = $derived(url.origin === document.location.origin);
    let target = $derived(targetProp ?? (isLocalHref ? undefined : "_blank"));
    let rel = $derived(relProp ?? (target ? "noopener noreferrer" : undefined));
</script>

<a class={["outer-link", className]} {href} {target} {rel} {...rest}>
    {@render children()}
</a>

<style>
    .outer-link.button:not(.card) {
        width: fit-content;
    }
</style>
