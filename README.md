# BITBLOCK SEXY ASCII

A modern, interactive ASCII art generator with real-time customization and a sleek interface.

## Live Demo

Try it out on CodePen: [BITBLOCK SEXY ASCII](https://codepen.io/OmPreetham/pen/emYREJN)

![BITBLOCK ASCII](bitblock.gif)

## Features

- **Interactive 3D Space**: Dynamic grid background that responds to mouse movement and drag interactions
- **Drag & Drop Support**: Simply drag and drop any image to convert it to ASCII art
- **Real-time Customization**:
  - Image Processing:
    - Width adjustment
    - Brightness control
    - Contrast enhancement
    - Multiple dithering options
  - ASCII Style:
    - Preset and custom character sets
    - Font size control
    - Text color customization
    - Various color modes (Normal, Inverted, Grayscale)
  - Advanced Options:
    - Edge detection
    - Threshold adjustment

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/OmPreetham/bitblock.git
cd bitblock
```

2. Open `index.html` in a modern web browser
   - No additional dependencies or setup required
   - Works best in Chrome, Firefox, or Safari

## Usage

1. **Converting Images**:
   - Drag and drop an image onto the window, or
   - Click "DROP / UPLOAD" to select a file

2. **Customizing Output**:
   - Click "CUSTOMIZATION" in the top right to access settings
   - Adjust parameters in real-time to perfect your ASCII art

3. **Saving Your Work**:
   - Click "COPY TEXT" to copy ASCII art to clipboard
   - Click "SAVE TXT" to download as a text file

## Customization Options

### Image Processing
- **Width**: Control the number of characters (20-200)
- **Brightness**: Adjust image brightness (0-200%)
- **Contrast**: Fine-tune contrast levels (0-200%)
- **Dithering**: Choose between None, Floyd-Steinberg, Atkinson, or Ordered

### ASCII Style
- **Character Sets**:
  - Standard: `@%#*+=-:. `
  - Blocks: `█▓▒░ `
  - Minimal: `#. `
  - Letters: `MWBHKDPO. `
  - Custom: Define your own character set

### Advanced Features
- **Edge Detection**: Enhance image edges (0-100)
- **Threshold**: Control black/white cutoff (0-255)

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

[MIT LICENSE](LICENSE) - Feel free to use, modify, and distribute this code.