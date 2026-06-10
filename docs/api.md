# Helium Prism API

### Navigation

- [Package exports](#package-exports)
- [Setup](#setup)
- [Text](#text)
- [Buttons and links](#buttons-and-links)
- [Inputs](#inputs)
- [Checkbox and toggle](#checkbox-and-toggle)
- [Shimmer](#shimmer)
- [Feedback and utility](#feedback-and-utility)
- [Icons](#icons)

## Package exports

- `.`: Svelte component and icon exports from `src/lib/index.ts`
- `./styles.css`: shared Helium tokens, typography, form, and button styles

Components exported from the package:

- `Button`
- `CardLink`, `Link`
- `Checkbox`, `Dropdown`, `Input`, `SearchBar`, `Toggle`
- `CopyIcon`, `GradientShimmer`, `HeliumLogo`, `Skeleton`, `Spinner`, `Text`, `Tooltip`
- Shared icon components listed in [Icons](#icons)

## Setup

Import the stylesheet once before using the components:

```svelte
<script>
    import "@imput/helium-prism/styles.css";
</script>
```

Import components from the package root:

```svelte
<script>
    import { Button } from "@imput/helium-prism";
</script>
```

## Text

`Text` renders the matching heading or paragraph element for a typography variant. Use `tag` when
the semantic element needs to be explicit.

```svelte
<script>
    import { Text } from "@imput/helium-prism";
</script>

<Text variant="display">Display</Text>
<Text variant="title">Title</Text>
<Text variant="heading">Heading</Text>
<Text variant="subheading">Subheading</Text>
<Text variant="body">Body copy.</Text>
<Text variant="caption">Caption copy.</Text>

<Text tag="h3" tone="secondary">Semantic heading</Text>
<Text tag="p" center>Centered paragraph.</Text>
```

Text variants are `display`, `title`, `heading`, `subheading`, `body`, and `caption`. Tones are
`primary`, `secondary`, `tertiary`, and `white`.

## Buttons and links

`Button` accepts native button attributes plus the Helium style props `primary`, `transparent`,
`card`, `selected`, and `circle`. `primary` and `transparent` are mutually exclusive.

```svelte
<script>
    import { Button, CardLink, IconArrowRight, IconDownload, Link } from "@imput/helium-prism";
</script>

<Button>Cancel</Button>
<Button primary>Continue <IconArrowRight /></Button>
<Button transparent>Secondary action</Button>
<Button disabled><IconDownload /> Download</Button>
<Button selected>Selected</Button>
<Button circle aria-label="Continue"><IconArrowRight /></Button>

<Button card>
    <span>Card action</span>
    <IconArrowRight />
</Button>

<Link href="https://helium.computer">Helium</Link>
<Link class="button" href="https://helium.computer">
    Button-style link
</Link>

<CardLink
    title="Read more"
    desc="Open the documentation"
    href="https://example.com"
/>
```

`Link` opens external URLs in a new tab by default and adds `noopener noreferrer`. Relative/local
links stay on the same page.

## Inputs

`Input`, `SearchBar`, and `Dropdown` support `bind:value`.

`Input` and `SearchBar` support `small` for compact fields.

`Input` accepts `leading` and `trailing` snippets for accessories.

```svelte
<script>
    import { Dropdown, IconChevronDown, IconLink, Input, SearchBar } from "@imput/helium-prism";

    let email = $state("");
    let query = $state("");
    let channel = $state("stable");
</script>

<SearchBar id="search" bind:value={query} aria-label="Search" />
<SearchBar
    id="fixed-search"
    bind:value={query}
    width="420px"
    aria-label="Fixed width search"
/>
<SearchBar
    id="small-search"
    bind:value={query}
    small
    aria-label="Small search"
/>

<Input id="email-small" bind:value={email} small aria-label="Small input" />
<Input id="email-medium" bind:value={email} width="320px" aria-label="Medium input" />
<Input id="email-icon" bind:value={email} aria-label="Input with icon">
    {#snippet leading()}
        <IconLink />
    {/snippet}
    {#snippet trailing()}
        <IconChevronDown />
    {/snippet}
</Input>

<Dropdown
    id="channel"
    bind:value={channel}
    width="260px"
    aria-label="Release channel"
    options={[
        { value: "stable", label: "Stable channel" },
        { value: "beta", label: "Beta channel" },
        { value: "nightly", label: "Nightly channel" },
    ]}
/>
<Dropdown id="platform" placeholder="Choose platform" aria-label="Platform">
    <option value="mac">macOS</option>
    <option value="windows">Windows</option>
    <option value="linux" disabled>Linux</option>
</Dropdown>
```

`Input`, `SearchBar`, and `Dropdown` require an `id` and `aria-label`. Placeholders are optional
visual hints and are not used as default labels.

## Checkbox and toggle

```svelte
<script>
    import { Checkbox, Toggle } from "@imput/helium-prism";

    let enabled = $state(true);
    let checked = $state(false);
</script>

<Checkbox id="terms" bind:checked>Checkbox text</Checkbox>

<Toggle
    bind:checked={enabled}
    name="Setting"
    desc="Short setting description."
/>
```

`Toggle` accepts native button attributes, renders with `role="switch"`, and calls `onchange` with
the next checked state when changed by user interaction.

## Shimmer

`GradientShimmer` fills its parent by default. Set `background` to cover the viewport. Binding the
component instance with `bind:this` exposes `intro()` and `emphasize()` after mount.

```svelte
<script>
    import { Button, GradientShimmer } from "@imput/helium-prism";

    let shimmer;
</script>

<div style="height: 320px">
    <GradientShimmer bind:this={shimmer} intro={false} />
</div>

<Button onclick={() => shimmer?.intro()}>Replay intro</Button>
<Button onclick={() => shimmer?.emphasize()}>Emphasize</Button>
```

Props:

- `intro`: starts the intro animation on mount. Defaults to `true`.
- `background`: positions the canvas fixed to the viewport. Defaults to `false`.

## Feedback and utility

```svelte
<script>
    import { Button, CopyIcon, HeliumLogo, Skeleton, Spinner, Tooltip } from "@imput/helium-prism";

    let copied = $state(false);
</script>

<HeliumLogo />
<HeliumLogo height="32px" />
<HeliumLogo text />
<HeliumLogo text height="32px" />

<Spinner />
<Spinner size={18} />

<Skeleton width="120px" height="38px" />

<Button onclick={() => (copied = !copied)}>
    <CopyIcon check={copied} />
    Copy
</Button>

{#snippet anchor()}
    <Button>Hover</Button>
{/snippet}

{#snippet content()}
    Tooltip content
{/snippet}

<Tooltip {anchor} {content} />
```

`CopyIcon` shows a copy icon by default. Pass `link` to use the link icon before the check
animation.

## Icons

Icon components are simple Svelte components that inherit the current text color and size from Prism
styles.

- `IconArrowDown`
- `IconArrowLeft`
- `IconArrowRight`
- `IconArrowUp`
- `IconBang`
- `IconCheck`
- `IconChevronDown`
- `IconCopy`
- `IconDownload`
- `IconExternalLink`
- `IconInfo`
- `IconLink`
- `IconLoader`
- `IconSearch`
- `IconWorld`
- `IconX`
