<img src="/meta/phosphor-mark-tight-black.png" width="128" align="right" />

# @phosphor-icons/webcomponents

Phosphor is a flexible icon family for interfaces, diagrams, presentations — whatever, really. Explore all our icons at [phosphoricons.com](https://phosphoricons.com).

[![NPM](https://img.shields.io/npm/v/@phosphor-icons/webcomponents.svg?style=flat-square)](https://www.npmjs.com/package/@phosphor-icons/webcomponents)

[![GitHub stars](https://img.shields.io/github/stars/phosphor-icons/webcomponents?style=flat-square&label=Star)](https://github.com/phosphor-icons/webcomponents)
[![GitHub forks](https://img.shields.io/github/forks/phosphor-icons/webcomponents?style=flat-square&label=Fork)](https://github.com/phosphor-icons/webcomponents/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/phosphor-icons/webcomponents?style=flat-square&label=Watch)](https://github.com/phosphor-icons/webcomponents)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

To add Phosphor web components to your app via CDN, you can include the following in the `<head>` of the document:

```html
<script
  type="module"
  src="https://unpkg.com/@phosphor-icons/webcomponents@2.1"
></script>
```

To use within ES modules, install the package and import once near the root of your app:

```bash
pnpm add @phosphor-icons/webcomponents
#^ Or whatever package manager you use
```

Then import either just the icons you need, or the entire library (this can be quite large):

```ts
import "@phoshpor-icons/webcomponents/PhHorse";
import "@phoshpor-icons/webcomponents/PhHeart";
import "@phoshpor-icons/webcomponents/PhCube";
// OR IF YOU NEED ALL ICONS:
import "@phosphor-icons/webcomponents";
```

## Usage

Add the custom elements to the document, using the `ph-` prefixed name of the icon as the custom element name:

```html
<body>
  <ph-horse></ph-horse>
  <ph-heart color="crimson" weight="fill"></ph-heart>
  <ph-cube></ph-cube>
</body>
```

### Styling

Icon components can be styled with the following attributes:

- **color?**: `string` – Icon stroke/fill color. Can be any CSS color string, including `hex`, `rgb`, `rgba`, `hsl`, `hsla`, named colors, or the special `currentColor` variable.
- **size?**: `number | string` – Icon height & width. This can be a number (defaults to pixels), or a string with units in `px`, `%`, `em`, `rem`, `pt`, `cm`, `mm`, `in`.
- **weight?**: `"thin" | "light" | "regular" | "bold" | "fill" | "duotone"` – Icon weight/style. Can also be used, for example, to "toggle" an icon's state: a rating component could use Stars with `weight="regular"` to denote an empty star, and `weight="fill"` to denote a filled star.
- **mirrored?**: `boolean` – Flip the icon horizontally. Can be useful in RTL languages where normal icon orientation is not appropriate.

## Our Related Projects

- [@phosphor-icons/homepage](https://github.com/phosphor-icons/homepage) ▲ Phosphor homepage and general info
- [@phosphor-icons/core](https://github.com/phosphor-icons/core) ▲ Phosphor icon assets and catalog
- [@phosphor-icons/react](https://github.com/phosphor-icons/react) ▲ Phosphor icon component library for React
- [@phosphor-icons/web](https://github.com/phosphor-icons/web) ▲ Phosphor icons for Vanilla JS
- [@phosphor-icons/vue](https://github.com/phosphor-icons/vue) ▲ Phosphor icon component library for Vue
- [@phosphor-icons/swift](https://github.com/phosphor-icons/swift) ▲ Phosphor icon component library for SwiftUI
- [@phosphor-icons/elm](https://github.com/phosphor-icons/phosphor-elm) ▲ Phosphor icons for Elm
- [@phosphor-icons/flutter](https://github.com/phosphor-icons/flutter) ▲ Phosphor IconData library for Flutter
- [@phosphor-icons/webcomponents](https://github.com/phosphor-icons/webcomponents) ▲ Phosphor icons as Web Components
- [@phosphor-icons/figma](https://github.com/phosphor-icons/figma) ▲ Phosphor icons Figma plugin
- [@phosphor-icons/sketch](https://github.com/phosphor-icons/sketch) ▲ Phosphor icons Sketch plugin
- [@phosphor-icons/pack](https://github.com/phosphor-icons/pack) ▲ Phosphor web font stripper to generate minimal icon bundles
- [@phosphor-icons/theme](https://github.com/phosphor-icons/theme) ▲ A VS Code (and other IDE) theme with the Phosphor color palette

## Community Projects

- [phosphor-react-native](https://github.com/duongdev/phosphor-react-native) ▲ Phosphor icon component library for React Native
- [phosphor-svelte](https://github.com/haruaki07/phosphor-svelte) ▲ Phosphor icons for Svelte apps
- [phosphor-r](https://github.com/dreamRs/phosphoricons) ▲ Phosphor icon wrapper for R documents and applications
- [blade-phosphor-icons](https://github.com/codeat3/blade-phosphor-icons) ▲ Phosphor icons in your Laravel Blade views
- [wireui/phosphoricons](https://github.com/wireui/phosphoricons) ▲ Phosphor icons for Laravel
- [phosphor-css](https://github.com/lucagoslar/phosphor-css) ▲ CSS wrapper for Phosphor SVG icons
- [ruby-phosphor-icons](https://github.com/maful/ruby-phosphor-icons) ▲ Phosphor icons for Ruby and Rails applications
- [eleventy-plugin-phosphoricons](https://github.com/reatlat/eleventy-plugin-phosphoricons) ▲ An Eleventy plugin for add shortcode, allows Phosphor icons to be embedded as inline svg into templates
- [phosphor-leptos](https://github.com/SorenHolstHansen/phosphor-leptos) ▲ Phosphor icon component library for Leptos apps (rust)
- [wordpress-phosphor-icons-block](https://github.com/robruiz/phosphor-icons-block) ▲ Phosphor icon block for use in WordPress v5.8+
- [ember-phosphor-icons](https://github.com/IgnaceMaes/ember-phosphor-icons) ▲ Phosphor icons for Ember apps

If you've made a port of Phosphor and you want to see it here, just open a PR [here](https://github.com/phosphor-icons/homepage)!

## License

MIT © [Phosphor Icons](https://github.com/phosphor-icons)
