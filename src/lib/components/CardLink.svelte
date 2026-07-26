<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import IconExternalLink from "./icons/IconExternalLink.svelte";

    type Props = {
        title: string;
        desc: string;
        href: string;
        disabled?: boolean;
        class?: ClassValue;
    };

    const { title, desc, href, disabled, class: className }: Props = $props();
</script>

<a
    class={[
        {
            button: true,
            card: true,
            disabled,
            "card-link": true,
        },
        className,
    ]}
    href={disabled ? undefined : href}
    target="_blank"
    rel="noopener noreferrer"
    aria-disabled={disabled}
    tabindex={disabled ? -1 : undefined}
>
    <div class="link-text">
        <h4>{title}</h4>
        <p>{desc}</p>
    </div>
    <IconExternalLink />
</a>

<style>
    .card-link {
        text-decoration: none;
        align-items: flex-start;
    }

    .link-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        overflow: hidden;
    }
</style>
