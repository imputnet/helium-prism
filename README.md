<p align="center">
    <img width="1000" alt="Helium Prism" src="https://raw.githubusercontent.com/imputnet/helium-prism/refs/heads/main/docs/prism-splash.png">
</p>

## Helium Prism
Shared UI components of [Helium](https://github.com/imputnet/helium) web interfaces for Svelte.

Prism UI library contains the shared building blocks used by web-based Helium applications and
websites, such as: typography, buttons, inputs, loading states, icons, and the brand gradient
shimmer effect.

This library isn't built for use outside of Helium web apps, so it may feel clunky for anything
else.

Demo: [prism.helium.computer](https://prism.helium.computer/) <br>
npm: [@imput/helium-prism](https://www.npmjs.com/package/@imput/helium-prism)

## Installation

deno:

```sh
deno add npm:@imput/helium-prism
```

pnpm:

```sh
pnpm add @imput/helium-prism
```

npm:

```sh
npm i @imput/helium-prism
```

## Basic usage

Import the stylesheet once near the root of your app:

```svelte
<script>
    import "@imput/helium-prism/styles.css";
</script>
```

Then import components from the package root:

```svelte
<script>
    import { Button } from "@imput/helium-prism";
</script>

<Button primary>Button</Button>
<Button>Button 2</Button>
```

You can also import all components at once if you're a madman or have an actual reason to do so
(such as for [demo](src/demo/App.svelte) purposes):

```svelte
<script>
    import * as Prism from "@imput/helium-prism";
</script>

<Prism.Button primary>Button</Prism.Button>
<Prism.Button>Button 2</Prism.Button>
```

## API docs

Sample usage of components is documented in [docs/api.md](docs/api.md).

## License

Helium Prism is licensed under GPL-3.0, just like the rest of Helium. See [LICENSE](LICENSE).
