import type { DsSpec } from './types';

/**
 * Volta (Toti-Gauna/supplements-ecommerce): el sistema «BOX». De noche, un box de entrenamiento (carbono, acero, tiza
 * y el voltio como luz de señal); de día, «Tiza», el laboratorio. Los valores salen de src/config/brands/volta.ts,
 * src/config/states.ts, app/globals.css y app/box.css; las temporadas solo cambian el acento (src/features/themes).
 * El marcador LED es la geometría de src/components/atoms/Led.tsx, dibujada acá una vez.
 */
export const DS: DsSpec = {
  "repo": "Toti-Gauna/supplements-ecommerce",
  "sha": "0ae34ddeef588ff866762b0b96ad1995595b638b",
  "themes": [
    {
      "id": "noche",
      "scheme": "dark",
      "vars": {
        "--brand-primary": "#c8ff2e",
        "--brand-primary-hover": "#d9ff6e",
        "--brand-on-primary": "#0b0c0d",
        "--brand-accent": "#1f2225",
        "--brand-ion": "#2ee6d6",
        "--brand-plasma": "#8b72ff",
        "--brand-background": "#0b0c0d",
        "--brand-surface": "#151719",
        "--brand-text": "#f2f0ea",
        "--brand-muted": "#a6abb0",
        "--brand-border": "#33383d",
        "--c-night": "#060707",
        "--c-night-2": "#121416",
        "--c-volt-ink": "#c8ff2e",
        "--brand-volt": "#c8ff2e",
        "--brand-volt-soft": "#e3ff8f",
        "--brand-on-night": "#f2f0ea",
        "--brand-night-muted": "#a6abb0",
        "--c-success": "#5be38a",
        "--c-success-soft": "#10241a",
        "--c-warning": "#ffc21a",
        "--c-warning-soft": "#2a2208",
        "--c-danger": "#ff6b5a",
        "--c-danger-soft": "#2c1512",
        "--season-accent": "#c8ff2e",
        "--season-accent-ink": "#060707",
        "--season-glow": "rgba(200,255,46,0.4)",
        "--led-volt": "#c8ff2e",
        "--led-chalk": "#f2f0ea",
        "--led-amber": "#ffc21a",
        "--led-red": "#ff6b5a",
        "--led-off": "0.08",
        "--led-glow": "5px",
        "--sh-card": "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 1px 0 rgb(0 0 0 / 0.6), 0 16px 30px -22px rgb(0 0 0 / 0.95)",
        "--sh-lift": "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 2px 0 rgb(0 0 0 / 0.6), 0 30px 50px -26px rgb(0 0 0 / 0.95)"
      },
      "source": {
        "path": "src/config/brands/volta.ts",
        "lines": [
          23,
          38
        ],
        "match": "primary: \"#c8ff2e\","
      }
    },
    {
      "id": "tiza",
      "scheme": "light",
      "vars": {
        "--brand-primary": "#131518",
        "--brand-primary-hover": "#2a2e33",
        "--brand-on-primary": "#c8ff2e",
        "--brand-accent": "#e8eae5",
        "--brand-ion": "#0a7770",
        "--brand-plasma": "#5a3fe6",
        "--brand-background": "#f3f3ef",
        "--brand-surface": "#fcfcfa",
        "--brand-text": "#131518",
        "--brand-muted": "#4a5058",
        "--brand-border": "#d3d6d0",
        "--c-night": "#111317",
        "--c-night-2": "#1b1e23",
        "--c-volt-ink": "#4a6a00",
        "--brand-volt": "#c8ff2e",
        "--brand-volt-soft": "#e3ff8f",
        "--brand-on-night": "#f2f0ea",
        "--brand-night-muted": "#a6abb0",
        "--c-success": "#1e6e3e",
        "--c-success-soft": "#e1efe4",
        "--c-warning": "#7a5200",
        "--c-warning-soft": "#f4ead2",
        "--c-danger": "#b3261e",
        "--c-danger-soft": "#f8e1de",
        "--season-accent": "#c8ff2e",
        "--season-accent-ink": "#111317",
        "--season-glow": "rgba(200,255,46,0.4)",
        "--led-volt": "#4a6a00",
        "--led-chalk": "#131518",
        "--led-amber": "#7a5200",
        "--led-red": "#b3261e",
        "--led-off": "0.07",
        "--led-glow": "0px",
        "--sh-card": "0 0 0 1px rgb(19 21 24 / 0.07), 0 1px 0 rgb(19 21 24 / 0.08), 0 14px 26px -20px rgb(19 21 24 / 0.32)",
        "--sh-lift": "0 0 0 1px rgb(19 21 24 / 0.08), 0 2px 0 rgb(19 21 24 / 0.08), 0 30px 50px -28px rgb(19 21 24 / 0.42)"
      },
      "source": {
        "path": "src/config/brands/volta.ts",
        "lines": [
          39,
          54
        ],
        "match": "background: \"#f3f3ef\","
      }
    },
    {
      "id": "halloween",
      "scheme": "dark",
      "vars": {
        "--brand-primary": "#c8ff2e",
        "--brand-primary-hover": "#d9ff6e",
        "--brand-on-primary": "#0b0c0d",
        "--brand-accent": "#1f2225",
        "--brand-ion": "#2ee6d6",
        "--brand-plasma": "#8b72ff",
        "--brand-background": "#0b0c0d",
        "--brand-surface": "#151719",
        "--brand-text": "#f2f0ea",
        "--brand-muted": "#a6abb0",
        "--brand-border": "#33383d",
        "--c-night": "#060707",
        "--c-night-2": "#121416",
        "--c-volt-ink": "#c8ff2e",
        "--brand-volt": "#c8ff2e",
        "--brand-volt-soft": "#e3ff8f",
        "--brand-on-night": "#f2f0ea",
        "--brand-night-muted": "#a6abb0",
        "--c-success": "#5be38a",
        "--c-success-soft": "#10241a",
        "--c-warning": "#ffc21a",
        "--c-warning-soft": "#2a2208",
        "--c-danger": "#ff6b5a",
        "--c-danger-soft": "#2c1512",
        "--season-accent": "#ff8a1f",
        "--season-accent-ink": "#1a1124",
        "--season-glow": "rgba(255,138,31,0.45)",
        "--led-volt": "#c8ff2e",
        "--led-chalk": "#f2f0ea",
        "--led-amber": "#ffc21a",
        "--led-red": "#ff6b5a",
        "--led-off": "0.08",
        "--led-glow": "5px",
        "--sh-card": "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 1px 0 rgb(0 0 0 / 0.6), 0 16px 30px -22px rgb(0 0 0 / 0.95)",
        "--sh-lift": "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 2px 0 rgb(0 0 0 / 0.6), 0 30px 50px -26px rgb(0 0 0 / 0.95)"
      },
      "source": {
        "path": "src/features/themes/skins.ts",
        "lines": [
          23,
          23
        ],
        "match": "accent: \"#ff8a1f\", accentInk: \"#1a1124\""
      }
    },
    {
      "id": "cyber-monday",
      "scheme": "dark",
      "vars": {
        "--brand-primary": "#c8ff2e",
        "--brand-primary-hover": "#d9ff6e",
        "--brand-on-primary": "#0b0c0d",
        "--brand-accent": "#1f2225",
        "--brand-ion": "#2ee6d6",
        "--brand-plasma": "#8b72ff",
        "--brand-background": "#0b0c0d",
        "--brand-surface": "#151719",
        "--brand-text": "#f2f0ea",
        "--brand-muted": "#a6abb0",
        "--brand-border": "#33383d",
        "--c-night": "#060707",
        "--c-night-2": "#121416",
        "--c-volt-ink": "#c8ff2e",
        "--brand-volt": "#c8ff2e",
        "--brand-volt-soft": "#e3ff8f",
        "--brand-on-night": "#f2f0ea",
        "--brand-night-muted": "#a6abb0",
        "--c-success": "#5be38a",
        "--c-success-soft": "#10241a",
        "--c-warning": "#ffc21a",
        "--c-warning-soft": "#2a2208",
        "--c-danger": "#ff6b5a",
        "--c-danger-soft": "#2c1512",
        "--season-accent": "#3ff0e0",
        "--season-accent-ink": "#03101a",
        "--season-glow": "rgba(63,240,224,0.45)",
        "--led-volt": "#c8ff2e",
        "--led-chalk": "#f2f0ea",
        "--led-amber": "#ffc21a",
        "--led-red": "#ff6b5a",
        "--led-off": "0.08",
        "--led-glow": "5px",
        "--sh-card": "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 1px 0 rgb(0 0 0 / 0.6), 0 16px 30px -22px rgb(0 0 0 / 0.95)",
        "--sh-lift": "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 2px 0 rgb(0 0 0 / 0.6), 0 30px 50px -26px rgb(0 0 0 / 0.95)"
      },
      "source": {
        "path": "src/features/themes/skins.ts",
        "lines": [
          24,
          24
        ],
        "match": "accent: \"#3ff0e0\", accentInk: \"#03101a\""
      }
    }
  ],
  "colors": [
    {
      "key": "marca",
      "tokens": [
        "--brand-primary",
        "--brand-primary-hover",
        "--brand-on-primary",
        "--brand-accent",
        "--brand-ion",
        "--brand-plasma"
      ],
      "source": {
        "path": "src/config/brand.ts",
        "lines": [
          27,
          32
        ],
        "match": "\"--brand-primary\": c.primary,"
      }
    },
    {
      "key": "fondo",
      "tokens": [
        "--brand-background",
        "--brand-surface",
        "--brand-text",
        "--brand-muted",
        "--brand-border",
        "--c-night",
        "--c-night-2",
        "--c-volt-ink"
      ],
      "source": {
        "path": "src/config/brand.ts",
        "lines": [
          33,
          40
        ],
        "match": "\"--brand-background\": c.background,"
      }
    },
    {
      "key": "firma",
      "tokens": [
        "--brand-volt",
        "--brand-volt-soft",
        "--brand-on-night",
        "--brand-night-muted"
      ],
      "source": {
        "path": "src/config/brand.ts",
        "lines": [
          53,
          54
        ],
        "match": "\"--brand-volt\": s.volt"
      }
    },
    {
      "key": "estados",
      "tokens": [
        "--c-success",
        "--c-success-soft",
        "--c-warning",
        "--c-warning-soft",
        "--c-danger",
        "--c-danger-soft"
      ],
      "source": {
        "path": "src/config/states.ts",
        "lines": [
          16,
          19
        ],
        "match": "dark: { success: \"#5be38a\""
      }
    },
    {
      "key": "temporada",
      "tokens": [
        "--season-accent",
        "--season-accent-ink",
        "--season-glow"
      ],
      "source": {
        "path": "app/box.css",
        "lines": [
          8,
          11
        ],
        "match": "--season-accent: var(--brand-volt);"
      }
    },
    {
      "key": "marcador",
      "tokens": [
        "--led-volt",
        "--led-chalk",
        "--led-amber",
        "--led-red"
      ],
      "source": {
        "path": "app/box.css",
        "lines": [
          12,
          18
        ],
        "match": "--led-volt: var(--brand-volt);"
      }
    }
  ],
  "pairs": [
    {
      "fg": "--brand-text",
      "bg": "--brand-background",
      "min": 4.5
    },
    {
      "fg": "--brand-muted",
      "bg": "--brand-surface",
      "min": 4.5
    },
    {
      "fg": "--brand-on-primary",
      "bg": "--brand-primary",
      "min": 4.5
    },
    {
      "fg": "--c-volt-ink",
      "bg": "--brand-background",
      "min": 4.5
    },
    {
      "fg": "--brand-on-night",
      "bg": "--c-night",
      "min": 4.5
    },
    {
      "fg": "--season-accent-ink",
      "bg": "--season-accent",
      "min": 4.5
    }
  ],
  "fonts": [
    {
      "family": "ds-volta-display",
      "name": "Big Shoulders Display",
      "key": "display",
      "weights": [
        600,
        800,
        900
      ],
      "source": {
        "path": "src/config/brand.ts",
        "lines": [
          15,
          16
        ],
        "match": "'Big Shoulders Display Variable'"
      }
    },
    {
      "family": "ds-volta-sans",
      "name": "Archivo",
      "key": "texto",
      "weights": [
        400,
        700,
        800
      ],
      "source": {
        "path": "src/config/brands/types.ts",
        "lines": [
          108,
          108
        ],
        "match": "fontFamily: \"'Archivo Variable'"
      }
    },
    {
      "family": "ds-volta-mono",
      "name": "JetBrains Mono",
      "key": "datos",
      "weights": [
        400,
        700
      ],
      "source": {
        "path": "src/config/brand.ts",
        "lines": [
          17,
          18
        ],
        "match": "'JetBrains Mono Variable'"
      }
    }
  ],
  "scale": {
    "radius": [
      {
        "token": "--radius-xs",
        "value": "1px"
      },
      {
        "token": "--radius-sm",
        "value": "2px"
      },
      {
        "token": "--radius-md",
        "value": "3px"
      },
      {
        "token": "--radius-lg",
        "value": "4px"
      },
      {
        "token": "--radius-card",
        "value": "2px"
      }
    ],
    "motion": [
      {
        "token": "--ease-out-expo",
        "value": "cubic-bezier(0.16, 1, 0.3, 1)",
        "kind": "ease"
      }
    ],
    "source": {
      "path": "app/globals.css",
      "lines": [
        50,
        63
      ],
      "match": "--radius-sm: 2px;"
    }
  },
  "components": [
    {
      "id": "ficha",
      "source": {
        "path": "src/components/molecules/ProductCard.tsx",
        "lines": [
          61,
          104
        ],
        "match": "data-product-card className=\"group relative"
      },
      "html": "<div class=\"vt-card-box\"><article class=\"vt-card\"><div class=\"vt-card-top\"><p class=\"vt-plate vt-card-head\"><span class=\"vt-card-brand\">{{houseBrand}}</span></p></div><div class=\"vt-card-body\"><h3 class=\"vt-display vt-card-name\">{{productName}}</h3><div><p class=\"vt-eyebrow vt-muted\">{{priceWord}}</p><div class=\"vt-card-price\"><span class=\"vt-sign vt-tone-volt\" aria-hidden=\"true\">$</span><svg class=\"vt-led vt-tone-volt\" role=\"img\" aria-label=\"{{priceReading}}\" viewBox=\"-2 -2 222 62\"><g transform=\"translate(8 0) skewX(-7)\"><g transform=\"translate(0 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(40 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><rect class=\"on\" x=\"81\" y=\"52\" width=\"6\" height=\"6\"/><g transform=\"translate(92 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(132 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7Z\"/></g><g transform=\"translate(172 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7Z\"/></g></g></svg></div><p class=\"vt-mini vt-mini-gap\"><span class=\"vt-ink\">{{perServingPrice}}</span> {{perServingWord}}</p><p class=\"vt-mini\">{{servingsLine}}</p></div><ul class=\"vt-stamps\" aria-label=\"{{stampsLabel}}\"><li>{{stamp}}</li></ul><div class=\"vt-card-foot\"><span class=\"vt-stock\"><span class=\"vt-lights\" role=\"img\" aria-label=\"{{lightsReading}}\"><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"out\"></span><span class=\"vt-light\" data-light=\"ok\"></span><span class=\"vt-light\" data-light=\"low\"></span></span><span class=\"vt-ink\">{{stockText}}</span></span><span class=\"vt-muted\">{{flavors}}</span></div><button type=\"button\" class=\"vt-add\" aria-label=\"{{addLabel}}\"><span class=\"vt-add-in\"><svg class=\"vt-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>{{add}}</span><span class=\"vt-add-price\">{{addPrice}}</span></button></div></article></div>"
    },
    {
      "id": "marcador",
      "source": {
        "path": "src/features/product/SheetScore.tsx",
        "lines": [
          20,
          33
        ],
        "match": "grid gap-px overflow-hidden rounded-sm"
      },
      "html": "<div class=\"vt-score-box\"><dl class=\"vt-score\" aria-label=\"{{scoreLabel}}\"><div class=\"vt-cell\"><dt class=\"vt-lab\">{{perServing}}</dt><dd class=\"vt-dd\"><span class=\"vt-sign vt-tone-chalk\" aria-hidden=\"true\">$</span><svg class=\"vt-led vt-tone-chalk\" role=\"img\" aria-label=\"{{perServingReading}}\" viewBox=\"-2 -2 182 62\"><g transform=\"translate(8 0) skewX(-7)\"><g transform=\"translate(0 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33Z\"/></g><rect class=\"on\" x=\"41\" y=\"52\" width=\"6\" height=\"6\"/><g transform=\"translate(52 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(92 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(132 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7Z\"/></g></g></svg></dd></div><div class=\"vt-cell\"><dt class=\"vt-lab\">{{protein}}</dt><dd class=\"vt-dd\"><svg class=\"vt-led vt-tone-chalk\" role=\"img\" aria-label=\"{{proteinReading}}\" viewBox=\"-2 -2 90 62\"><g transform=\"translate(8 0) skewX(-7)\"><g transform=\"translate(0 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(40 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g></g></svg><span class=\"vt-unit\" aria-hidden=\"true\">g</span></dd></div><div class=\"vt-cell\"><dt class=\"vt-lab\">{{servings}}</dt><dd class=\"vt-dd\"><svg class=\"vt-led vt-tone-chalk\" role=\"img\" aria-label=\"{{servingsReading}}\" viewBox=\"-2 -2 90 62\"><g transform=\"translate(8 0) skewX(-7)\"><g transform=\"translate(0 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(40 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7Z\"/></g></g></svg></dd></div><div class=\"vt-cell\"><dt class=\"vt-lab\">{{lasts}}</dt><dd class=\"vt-dd\"><svg class=\"vt-led vt-tone-volt\" role=\"img\" aria-label=\"{{lastsReading}}\" viewBox=\"-2 -2 90 62\"><g transform=\"translate(8 0) skewX(-7)\"><g transform=\"translate(0 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/></g><g transform=\"translate(40 0)\"><path class=\"off\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7ZM4,29 7,26 25,26 28,29 25,32 7,32Z\"/><path class=\"on\" d=\"M4,3 7,0 25,0 28,3 25,6 7,6ZM29,4 32,7 32,25 29,28 26,25 26,7ZM29,30 32,33 32,51 29,54 26,51 26,33ZM4,55 7,52 25,52 28,55 25,58 7,58ZM3,30 6,33 6,51 3,54 0,51 0,33ZM3,4 6,7 6,25 3,28 0,25 0,7Z\"/></g></g></svg><span class=\"vt-unit\" aria-hidden=\"true\">{{days}}</span></dd></div></dl></div>"
    },
    {
      "id": "cupon",
      "source": {
        "path": "src/components/molecules/CouponTicket.tsx",
        "lines": [
          18,
          40
        ],
        "match": "floor relative grid w-[6.5rem]"
      },
      "html": "<div class=\"vt-ticket\"><div class=\"vt-stub vt-floor\"><span class=\"vt-stub-season\" aria-hidden=\"true\"></span><span class=\"vt-stub-in\"><span class=\"vt-display vt-stub-val\">{{couponValue}}</span><span class=\"vt-stub-off\">{{couponOff}}</span></span></div><div class=\"vt-perf\" aria-hidden=\"true\"><span class=\"vt-notch vt-notch-t\"></span><span class=\"vt-notch vt-notch-b\"></span><span class=\"vt-dash\"></span></div><div class=\"vt-ticket-body\"><div class=\"vt-ticket-text\"><p class=\"vt-ticket-desc\">{{couponDesc}}</p><p class=\"vt-ticket-code\">{{couponCode}}</p></div><button type=\"button\" class=\"vt-btn vt-btn-primary vt-btn-sm\" aria-label=\"{{applyLabel}}\">{{apply}}</button></div></div>"
    },
    {
      "id": "botones",
      "source": {
        "path": "src/components/atoms/Button.tsx",
        "lines": [
          16,
          27
        ],
        "match": "secondary: \"plate border border-line text-ink"
      },
      "html": "<div class=\"vt-row\"><button type=\"button\" class=\"vt-btn vt-btn-primary vt-btn-lg\"><svg class=\"vt-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"/><path d=\"M3 6h18\"/><path d=\"M16 10a4 4 0 0 1-8 0\"/></svg>{{addToCart}}</button><button type=\"button\" class=\"vt-btn vt-btn-secondary\"><svg class=\"vt-ico\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><path d=\"M8 7v10\"/><path d=\"M12 7v10\"/><path d=\"M17 7v10\"/></svg>{{sellCounter}}</button></div>"
    },
    {
      "id": "pestanas",
      "source": {
        "path": "src/components/molecules/SegmentedTabs.tsx",
        "lines": [
          45,
          58
        ],
        "match": "rounded-sm border border-line bg-surface p-1"
      },
      "html": "<div class=\"vt-seg\"><div role=\"tablist\" aria-label=\"{{tabsLabel}}\" class=\"vt-tabs\"><span class=\"vt-ind\" aria-hidden=\"true\"><span class=\"vt-ind-run\"><span class=\"vt-ind-mark\"></span></span></span><button type=\"button\" role=\"tab\" aria-selected=\"true\" class=\"vt-tab vt-tab-1\" data-ds-pick>{{tab1}}</button><button type=\"button\" role=\"tab\" aria-selected=\"false\" class=\"vt-tab vt-tab-2\" data-ds-pick>{{tab2}}</button><button type=\"button\" role=\"tab\" aria-selected=\"false\" class=\"vt-tab vt-tab-3\" data-ds-pick>{{tab3}}</button></div></div>"
    },
    {
      "id": "campo",
      "source": {
        "path": "src/components/atoms/Field.tsx",
        "lines": [
          4,
          20
        ],
        "match": "w-full min-h-12 rounded-sm border border-line"
      },
      "html": "<div class=\"vt-field\"><label for=\"ds-volta-pk-name\" class=\"vt-label\">{{fieldLabel}}</label><input id=\"ds-volta-pk-name\" class=\"vt-input\" type=\"text\" maxlength=\"60\" placeholder=\"{{fieldPlaceholder}}\"></div>"
    }
  ]
};
