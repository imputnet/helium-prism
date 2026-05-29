<script lang="ts">
    import * as Prism from "../lib/index.ts";
    import "../css/styles.css";

    let checked = $state(true);
    let search = $state("");
    let input = $state("");
    let email = $state("");
    let shortcut = $state("Command K");
    let browser = $state("");
    let channel = $state("stable");

    let toggle1 = $state(true);
    let toggle2 = $state(false);
    let toggle3 = $state(true);
    let toggle4 = $state(false);

    let copied = $state(false);

    let shimmerVisible = $state(true);
    let shimmerIntro = $state(false);
    let shimmerBackground = $state(false);
    let shimmerKey = $state(0);
    let shimmer: { intro: () => void; emphasize: () => void } | undefined = $state();

    const remountShimmer = () => {
        shimmerKey += 1;
    };
</script>

<svelte:head>
    <title>Helium Prism Components Demo</title>
</svelte:head>

{#if shimmerVisible && shimmerBackground}
    {#key `background-${shimmerKey}`}
        <Prism.GradientShimmer
            bind:this={shimmer}
            intro={shimmerIntro}
            background
            class="demo-background-shimmer"
        />
    {/key}
{/if}

<main class={["demo-shell", shimmerBackground && "glass-children"]}>
    <section class="showcase-section">
        <div class="section-heading intro">
            <Prism.HeliumLogo height="32px" />
            <Prism.Text variant="caption">
                Prism: shared UI primitives for Helium web interfaces.
            </Prism.Text>
            <div class="row">
                <Prism.OuterLink class="button primary" href="https://helium.computer/">
                    <Prism.IconArrowRight />
                    Get Helium Browser
                </Prism.OuterLink>
                <Prism.OuterLink class="button" href="https://github.com/imputnet/helium-prism">
                    <Prism.IconExternalLink />
                    Prism on GitHub
                </Prism.OuterLink>
            </div>
        </div>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Text</Prism.Text>
            <Prism.Text variant="caption"
            >Native element styles and the reusable Text primitive.</Prism.Text>
        </div>

        <div class="type-grid">
            <div class="type-stack">
                <h1>Heading one</h1>
                <h2>Heading two</h2>
                <h3>Heading three</h3>
                <h4>Heading four</h4>
                <h5>Heading five</h5>
                <h6>Heading six</h6>
                <p>Paragraph text uses the shared secondary tone and compact Helium line height.</p>
            </div>

            <div class="type-stack">
                <Prism.Text variant="display">Display text</Prism.Text>
                <Prism.Text variant="title">Title text</Prism.Text>
                <Prism.Text variant="heading">Heading text</Prism.Text>
                <Prism.Text variant="subheading">Subheading text</Prism.Text>
                <Prism.Text variant="body">Body text</Prism.Text>
                <Prism.Text variant="caption">Caption text</Prism.Text>
            </div>
        </div>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Buttons</Prism.Text>
            <Prism.Text variant="caption"
            >With icons, primary, selected, and disabled states.</Prism.Text>
        </div>

        <div class="button-grid">
            <div class="control-group">
                <Prism.Text variant="subheading">Default</Prism.Text>
                <div class="row">
                    <Prism.Button>Plain</Prism.Button>
                    <Prism.Button><Prism.IconCheck /> Confirm</Prism.Button>
                    <Prism.Button><Prism.IconArrowLeft /> Back</Prism.Button>
                    <Prism.Button
                        circle
                        aria-label="Open link"
                    ><Prism.IconExternalLink /></Prism.Button>
                </div>
            </div>

            <div class="control-group">
                <Prism.Text variant="subheading">Primary</Prism.Text>
                <div class="row">
                    <Prism.Button primary><Prism.IconArrowRight /> Continue</Prism.Button>
                    <Prism.Button primary><Prism.IconDownload /> Download</Prism.Button>
                    <Prism.Button
                        primary
                        circle
                        aria-label="Done"
                    ><Prism.IconCheck /></Prism.Button>
                </div>
            </div>

            <div class="control-group">
                <Prism.Text variant="subheading">States</Prism.Text>
                <div class="row">
                    <Prism.Button selected><Prism.IconCheck /> Selected</Prism.Button>
                    <Prism.Button disabled><Prism.IconDownload /> Disabled</Prism.Button>
                </div>
            </div>
        </div>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Shimmer</Prism.Text>
            <Prism.Text variant="caption"
            >Shimmering gradient effect with idle, intro, and emphasis states.</Prism.Text>
        </div>

        <div class="wide-stack">
            <div class="row">
                <Prism.Button onclick={remountShimmer}>Remount</Prism.Button>
                <Prism.Button onclick={() => shimmer?.intro()}>Replay intro</Prism.Button>
                <Prism.Button onclick={() => shimmer?.emphasize()}>Emphasize</Prism.Button>
            </div>
            <div class="row">
                <Prism.Checkbox id="demo-shimmer-visible" bind:checked={shimmerVisible}
                >Visible</Prism.Checkbox>
                <Prism.Checkbox id="demo-shimmer-intro" bind:checked={shimmerIntro}
                >Intro on mount</Prism.Checkbox>
                <Prism.Checkbox id="demo-shimmer-background" bind:checked={shimmerBackground}
                >Background</Prism.Checkbox>
            </div>
        </div>

        {#if !shimmerBackground}
            <div class="shimmer-panel">
                {#if shimmerVisible}
                    {#key `contained-${shimmerKey}`}
                        <Prism.GradientShimmer bind:this={shimmer} intro={shimmerIntro} />
                    {/key}
                {/if}
            </div>
        {/if}
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Links</Prism.Text>
            <Prism.Text variant="caption">Regular and button links.</Prism.Text>
        </div>

        <div class="control-group">
            <div class="row">
                <Prism.OuterLink href="https://helium.computer"
                >Plain external link</Prism.OuterLink>
                <Prism.OuterLink href="#misc">Hash link</Prism.OuterLink>
            </div>
        </div>
        <Prism.OuterLink class="button" href="https://helium.computer">
            <Prism.IconExternalLink />
            Button-style external link
        </Prism.OuterLink>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Card Actions</Prism.Text>
            <Prism.Text variant="caption"
            >Large action buttons for richer interactions and different context.</Prism.Text>
        </div>

        <div class="wide-stack">
            <Prism.Button card>
                <div class="card-button-text">
                    <Prism.Text variant="subheading">Privacy and security</Prism.Text>
                    <Prism.Text variant="body"
                    >Card buttons can hold titles, descriptions, and trailing icons.</Prism.Text>
                </div>
                <Prism.IconArrowRight />
            </Prism.Button>

            <Prism.Button card>
                <Prism.IconDownload />
                <div class="card-button-text">
                    <Prism.Text variant="subheading">Download an archive</Prism.Text>
                    <Prism.Text variant="body"
                    >The same card action layout with a leading icon.</Prism.Text>
                </div>
            </Prism.Button>

            <Prism.Button card>
                <Prism.IconCheck />
                <div class="card-button-text">
                    <Prism.Text variant="subheading">Helium services</Prism.Text>
                    <Prism.Text variant="body"
                    >A card action can show leading and trailing icons together. Card's text can
                        also be very long, so it has to be split into several lines.</Prism.Text>
                </div>
                <Prism.IconArrowRight />
            </Prism.Button>

            <Prism.CardLink
                title="External link"
                desc="Outer link action card with supporting text."
                href="https://helium.computer"
            />
        </div>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Toggles</Prism.Text>
            <Prism.Text variant="caption"
            >Preference controls with title, description, and switch state.</Prism.Text>
        </div>

        <div class="wide-stack">
            <Prism.Toggle
                bind:checked={toggle1}
                name="Zen mode"
                desc="Hide toolbar and tab strip until hovering near their edges"
            />
            <Prism.Toggle
                bind:checked={toggle2}
                name="Background action confirmation toasts"
                desc="Shows a toast notification when you copy content, such as links and images, or open a new background tab in Zen mode"
            />
            <Prism.Toggle
                bind:checked={toggle3}
                name="Show a rounded frame around web contents"
            />
            <Prism.Toggle
                bind:checked={toggle4}
                name="Use ⌘+S to toggle vertical tabs in Vertical layout, and even more text to make it wrap to next line"
            />
        </div>
    </section>

    <section class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Inputs</Prism.Text>
            <Prism.Text variant="caption"
            >Checkbox, search bar, flexible input fields, size options, and
                accessories.</Prism.Text>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">Checkbox</Prism.Text>
            <div class="row">
                <Prism.Checkbox id="demo-checkbox-text" bind:checked>Checkbox text</Prism.Checkbox>
                <Prism.Checkbox id="demo-checkbox-empty" aria-label="Empty checkbox" />
            </div>
        </div>

        <div class="input-stack">
            <div class="control-group">
                <Prism.Text variant="subheading">SearchBar</Prism.Text>
                <Prism.SearchBar
                    id="demo-regular-search"
                    bind:value={search}
                    width="320px"
                    placeholder="Search bangs"
                    aria-label="Search bangs"
                />
                <Prism.SearchBar
                    id="demo-small-search"
                    bind:value={search}
                    small
                    placeholder="Search shortcuts"
                    aria-label="Search shortcuts"
                />
            </div>
            <div class="control-group">
                <Prism.Text variant="subheading">Input</Prism.Text>
                <Prism.Input
                    id="demo-medium-input"
                    bind:value={input}
                    placeholder="Text input"
                    aria-label="Text input"
                />
                <Prism.Input
                    id="demo-small-input"
                    bind:value={input}
                    small
                    placeholder="Small input with custom width"
                    aria-label="Small input with custom width"
                    width="320px"
                />
            </div>

            <div class="control-group">
                <Prism.Text variant="subheading">Accessories</Prism.Text>
                <Prism.Input
                    id="demo-email-input"
                    bind:value={email}
                    type="email"
                    placeholder="Email address"
                    aria-label="Email address"
                >
                    {#snippet leading()}
                        <Prism.IconArrowRight />
                    {/snippet}
                </Prism.Input>
                <Prism.Input
                    id="demo-shortcut-input"
                    bind:value={shortcut}
                    aria-label="Keyboard shortcut"
                >
                    {#snippet trailing()}
                        <Prism.IconChevronDown />
                    {/snippet}
                </Prism.Input>
                <Prism.Input
                    id="demo-disabled-input"
                    placeholder="Disabled input"
                    aria-label="Disabled input"
                    disabled
                />
            </div>

            <div class="control-group">
                <Prism.Text variant="subheading">Dropdown</Prism.Text>
                <Prism.Dropdown
                    id="demo-browser-dropdown"
                    bind:value={browser}
                    placeholder="Custom width"
                    width="260px"
                    aria-label="Browser"
                    options={[
                        { value: "helium", label: "Helium" },
                        { value: "safari", label: "Safari" },
                        { value: "firefox", label: "Firefox" },
                    ]}
                />
                <Prism.Dropdown
                    id="demo-channel-dropdown"
                    bind:value={channel}
                    aria-label="Release channel"
                    options={[
                        { value: "stable", label: "Stable channel" },
                        { value: "beta", label: "Beta channel" },
                        { value: "alpha", label: "Alpha channel" },
                    ]}
                />
                <Prism.Dropdown
                    id="demo-disabled-dropdown"
                    placeholder="Disabled dropdown"
                    aria-label="Disabled dropdown"
                    disabled
                    options={[]}
                />
            </div>
        </div>
    </section>

    <section id="misc" class="showcase-section">
        <div class="section-heading">
            <Prism.Text variant="heading">Misc</Prism.Text>
            <Prism.Text variant="caption"
            >Loading, shimmer, checkbox, skeleton, copy, and tooltip states.</Prism.Text>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">HeliumLogo</Prism.Text>
            <div class="row">
                <Prism.HeliumLogo />
                <Prism.HeliumLogo text />
            </div>
            <div class="row">
                <Prism.HeliumLogo height="48px" />
                <Prism.HeliumLogo text height="48px" />
            </div>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">Spinner</Prism.Text>
            <div class="row">
                <Prism.Spinner />
                <Prism.Button aria-label="Loading" disabled>
                    <Prism.Spinner size={18} />
                    Download
                </Prism.Button>
            </div>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">Skeleton</Prism.Text>
            <div class="row">
                <Prism.Skeleton width="38px" height="38px" />
                <Prism.Skeleton width="220px" height="38px" />
                <Prism.Skeleton width="120px" height="38px" />
                <Prism.Skeleton width="220px" height="18px" />
            </div>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">CopyIcon</Prism.Text>
            <Prism.Button onclick={() => (copied = !copied)}>
                <Prism.CopyIcon check={copied} />
                Copy
            </Prism.Button>
        </div>

        <div class="control-group">
            <Prism.Text variant="subheading">Tooltip</Prism.Text>

            {#snippet tooltipAnchor()}
                <Prism.Button>I have a tip, hover me</Prism.Button>
            {/snippet}

            {#snippet tooltipContent()}
                Be kind and enjoy the sun more
            {/snippet}

            <Prism.Tooltip anchor={tooltipAnchor} content={tooltipContent} />
        </div>
    </section>
</main>

<style>
    .demo-shell {
        --demo-content-width: 960px;
        --demo-copy-width: 660px;

        position: relative;
        z-index: 1;
        display: grid;
        gap: clamp(30px, 5vw, 48px);
        width: min(100%, var(--demo-content-width));
        margin: 0 auto;
        padding: clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px);
    }

    .showcase-section {
        display: grid;
        gap: var(--gap-2);
        justify-items: start;
        min-width: 0;
        width: 100%;
    }

    .intro {
        display: grid;
        gap: var(--gap-1);
    }

    .section-heading {
        display: grid;
        gap: var(--gap);
        width: min(100%, var(--demo-copy-width));

        &.intro {
            gap: var(--gap-1);
        }
    }

    .type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
        gap: clamp(16px, 3vw, 24px);
        width: 100%;
        align-items: start;
    }

    .button-grid {
        display: flex;
        flex-direction: column;
        gap: clamp(16px, 3vw, 24px);
        width: min(100%, var(--demo-copy-width));
        align-items: stretch;
    }

    .type-stack,
    .control-group,
    .wide-stack {
        display: grid;
        gap: var(--gap-1);
        justify-items: start;
        min-width: 0;
        width: 100%;
    }

    .wide-stack {
        width: min(100%, var(--demo-copy-width));
    }

    .input-stack {
        display: grid;
        gap: 18px;
        width: min(100%, var(--demo-copy-width));
    }

    .shimmer-panel {
        width: min(calc(100vw - 32px), 1280px);
        justify-self: center;
        margin-inline: calc((100% - min(calc(100vw - 32px), 1280px)) / 2);
        aspect-ratio: 16 / 9;
        min-height: clamp(260px, 52vw, 520px);
        max-height: 760px;
        overflow: hidden;
        border-radius: var(--card-border-radius);
        outline: 1px solid var(--helium-elevated-10);
        outline-offset: -1px;
    }

    :global(.demo-background-shimmer) {
        z-index: 0;
    }

    .row {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--gap-1);
        min-width: 0;
        width: 100%;
    }

    .row :global(.button:not(.circle)),
    .row :global(button:not(.circle)) {
        max-width: 100%;
        white-space: normal;
    }

    .input-stack :global(.search-bar),
    .input-stack :global(.input-field),
    .input-stack :global(.dropdown) {
        max-width: 100%;
    }

    .card-button-text {
        display: grid;
        gap: calc(var(--gap) / 2);
        width: 100%;
        min-width: 0;
    }
</style>
