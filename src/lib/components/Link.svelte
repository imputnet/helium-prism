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

    const isExternalHref = (href: string) => {
        try {
            return new URL(href, location.href).origin !== location.origin;
        } catch {
            return true;
        }
    };

    let isExternal = $derived(isExternalHref(href));
    let target = $derived(isExternal ? (targetProp ?? "_blank") : undefined);
    let rel = $derived(isExternal ? (relProp ?? "noopener noreferrer") : undefined);
</script>

<a class={["p-link", className]} {href} {target} {rel} {...rest}>
    {@render children()}
</a>

<style>
    .p-link.button:not(.card) {
        width: fit-content;
    }
</style>
