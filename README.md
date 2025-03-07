# BITBLOCK SEXY ASCII

A modern, interactive ASCII art generator with real-time customization and a sleek interface.

## Live Demo

Try it out on CodePen: [BITBLOCK SEXY ASCII](https://codepen.io/ompreetham/pen/QWPBwLg)

![BITBLOCK ASCII](bitblock.gif)

## Features

- **Interactive 3D Space**: Dynamic grid background that responds to mouse movement and drag interactions
- **Multiple Input Methods**:
  - Drag & Drop image files
  - File selection dialog
  - Real-time webcam conversion
- **Real-time Customization**:
  - Image Processing:
    - Width adjustment
    - Brightness control
    - Contrast enhancement
    - Multiple dithering options
  - ASCII Style:
    - Preset and custom character sets
    - Font size control (fixed at 9px for optimal display)
    - Text color customization
    - Various color modes (Normal, Inverted, Grayscale)
  - Advanced Options:
    - Toggle-based Edge detection
    - Toggle-based Threshold adjustment

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bitblock.git
cd bitblock
```

2. Start a local server:
```bash
node server.js
```

3. Open `http://localhost:3000` in a modern web browser
   - No additional dependencies required
   - Works best in Chrome, Firefox, or Safari

## Usage

1. **Converting Images**:
   - Drag and drop an image onto the window
   - Click "SELECT FILE" to choose an image
   - Click "WEBCAM" for real-time conversion

2. **Using Webcam**:
   - Click the "WEBCAM" button with the pulsing green indicator
   - Grant camera permissions when prompted
   - Webcam feed will automatically convert to ASCII
   - Switch to image mode at any time by selecting or dropping an image

3. **Customizing Output**:
   - Click "CUSTOMIZATION" in the top right to access settings
   - Adjust parameters in real-time
   - Toggle advanced features like edge detection and threshold

4. **Saving Your Work**:
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

MIT License - Feel free to use, modify, and distribute this code.

## Credits

Created with ♥ by [Your Name]