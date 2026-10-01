# Aether Run

Aether Run is an interactive Three.js concept that combines a cinematic game landing page with a small playable 3D platforming experience. The player moves across a sequence of floating platforms, collects energy shards, and attempts to reach the final platform above the clouds.

The project is intentionally lightweight: its world, character, platforms, lighting, particles, and collectibles are generated with JavaScript rather than downloaded as external 3D models. It can therefore be hosted as a static website without a backend, database, build system, or user account service.

## Project status

This repository contains the original browser-based prototype. It is suitable as:

- A playable concept demo
- A Three.js learning project
- A visual reference for a larger game
- A promotional website for a future desktop release
- A foundation for experimenting with browser-based 3D gameplay

It is not currently a complete commercial game. Features such as save files, multiple levels, settings, accessibility preferences, advanced physics, and production audio would need additional development.

## Features

- Real-time 3D graphics rendered with Three.js and WebGL
- Eight floating platforms, including moving platforms
- Automatic forward movement and player-controlled lateral movement
- Jumping, gravity, collision detection, falling, and restarting
- Seven collectible energy shards
- Completion state when the player reaches the final platform
- Smooth camera tracking
- Procedurally generated character and environment
- Atmospheric fog, lighting, shadows, particles, and orbital rings
- Optional synthesized sound effects created with the Web Audio API
- Keyboard and touchscreen controls
- Responsive layouts for desktop and mobile screens
- Reduced-motion support for visitors who request it through their operating system
- Semantic HTML, visible keyboard focus, and live status messaging
- No framework, compilation, or package installation required

## Controls

| Action | Keyboard | Touchscreen |
| --- | --- | --- |
| Move left | `A` or `←` | Left arrow button |
| Move right | `D` or `→` | Right arrow button |
| Jump | `Space` | Jump button |
| Restart | `R` | Restart button in the HUD |
| Toggle sound | Sound button | Sound button |

The character moves forward automatically after **Enter the world** is selected. Use lateral movement and jumping to land on each platform.

## Technologies

| Technology | Responsibility |
| --- | --- |
| HTML5 | Page structure, navigation, content, controls, and accessibility semantics |
| CSS3 | Responsive layout, typography, color, transitions, interface styling, and reduced-motion behavior |
| JavaScript | Game state, movement, collision checks, input handling, sound, animation, and interface updates |
| Three.js | Scene graph, meshes, materials, lights, camera, shadows, fog, particles, and WebGL rendering |
| WebGL | Hardware-accelerated 3D rendering in the browser |
| Web Audio API | Small synthesized sound effects without external audio files |

Three.js is a JavaScript library rather than a separate programming language. It provides a higher-level interface over WebGL, which is the browser technology that communicates with the computer's graphics hardware.

## Repository structure

```text
three.js-project/
├── index.html     # Page structure, interface, content, and Three.js import map
├── styles.css     # Complete visual design and responsive behavior
├── app.js         # 3D scene, player movement, gameplay, camera, and sound
└── README.md      # Project documentation
```

### `index.html`

The HTML file contains:

- The main navigation
- Hero and game canvas container
- Game heads-up display (HUD)
- Completion message
- Touch controls
- Informational and promotional sections
- Keyboard-control documentation
- Footer and loading screen
- The import map that tells the browser where to load Three.js

The browser loads Three.js from jsDelivr:

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
    }
  }
</script>
```

An internet connection is required for this hosted module and the Google Fonts used by the design.

### `styles.css`

The stylesheet defines the full visual system, including:

- Design tokens such as the black, off-white, blue-gray, and acid-green palette
- Full-screen game canvas and cinematic overlays
- Navigation, buttons, HUD, and completion dialog
- Informational sections and feature cards
- CSS-generated decorative illustrations
- Mobile breakpoints
- Touchscreen controls
- Loader animation
- Focus indicators and reduced-motion handling

### `app.js`

The JavaScript module is divided conceptually into these systems:

1. Renderer, scene, and camera initialization
2. Lighting and environmental effects
3. Platform and collectible generation
4. Player-model construction
5. Game state and audio
6. Movement, gravity, and collision checks
7. Camera movement and animation loop
8. Keyboard, pointer, and interface event handling

## How the 3D scene works

Every Three.js experience begins with three main components:

```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 350);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
```

- The **scene** is the container holding all 3D objects.
- The **camera** determines which part of the scene is visible.
- The **renderer** draws the camera's view into a WebGL canvas.

The render loop requests a new frame from the browser, updates gameplay, moves the camera, and redraws the scene:

```javascript
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.035);
  const elapsed = clock.elapsedTime;

  updateGame(delta, elapsed);
  renderer.render(scene, camera);
}
```

`delta` is the elapsed time since the previous frame. Movement is multiplied by this value so gameplay remains reasonably consistent across monitors with different refresh rates.

## Level construction

The course is described by a compact layout array in `app.js`:

```javascript
[
  [0, 0, 0, 7, 5, false],
  [0, 1.1, -7, 4.2, 3.3, false],
  [3.3, 2.2, -13, 3.6, 3.5, true]
].forEach((entry) => createPlatform(...entry));
```

Each entry provides:

```text
x position, y position, z position, width, depth, moving
```

Add another entry to extend the level. The final Boolean value determines whether the platform moves horizontally.

## Player movement

The player uses a velocity vector with horizontal movement, automatic forward movement, and gravity:

```javascript
state.velocity.x += direction * 20 * delta;
state.velocity.z = Math.max(state.velocity.z - 9.3 * delta, -5.2);
state.velocity.y -= 20 * delta;
player.position.addScaledVector(state.velocity, delta);
```

This is a small custom movement system rather than a full physics engine. Platform landings are determined by comparing the player's previous and current position with each platform's bounds.

## Running locally

Because the project uses JavaScript modules, run it through a local HTTP server. Opening `index.html` directly with a `file://` address can behave differently between browsers.

### Option 1: Node.js

If Node.js is installed:

```bash
npx serve .
```

Open the local address printed in the terminal, commonly `http://localhost:3000`.

### Option 2: Python

If Python is installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 3: Visual Studio Code

Open the repository folder in Visual Studio Code and use a local-server extension, or open its integrated terminal and run one of the commands above.

## Publishing with GitHub Pages

The project is ready to be hosted from the repository root.

1. Open the repository on GitHub.
2. Select **Settings**.
3. Select **Pages** under **Code and automation**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder.
6. Save the configuration.

GitHub will build the site and display its public URL when deployment completes. A typical project-site address has this form:

```text
https://jeffreyinteriano.github.io/three.js-project/
```

Deployment can take several minutes after a new commit is pushed.

## Customizing the game

### Change the color palette

Edit the custom properties at the beginning of `styles.css`:

```css
:root {
  --ink: #0a0a0a;
  --paper: #f2f1ec;
  --acid: #d9ff43;
  --muted: #777771;
}
```

The equivalent 3D material colors are defined near the beginning of `app.js`.

### Change movement

Important movement values are located in `updateGame()` and `jump()`:

- `20` controls lateral acceleration.
- `-5.2` is the maximum forward speed.
- `20` controls gravity.
- `8.5` is the jump velocity.

Change one value at a time and test the entire course after every adjustment.

### Add platforms

Add entries to the `createPlatform` layout array. Platforms should be spaced closely enough for the current forward speed and jump strength. Each platform after the starting platform automatically receives a shard.

### Add 3D models

For production models, use Three.js's `GLTFLoader` and the glTF or GLB format. Replace the generated player mesh only after the movement and collision behavior is stable.

### Add sound and music

The current prototype generates short tones with the Web Audio API. Production audio can be loaded with `THREE.Audio`, standard HTML audio elements, or a dedicated audio library. Provide volume controls and begin playback only after user interaction because browsers restrict automatic audio.

## Accessibility and input

The surrounding website includes:

- A skip link
- Semantic navigation and section landmarks
- Visible keyboard focus
- Descriptive button labels
- A polite live region for game status
- Reduced-motion styles
- Touch controls on coarse-pointer devices

The Three.js canvas is decorative to assistive technology because the game itself is spatial and visual. A production version should provide additional audio cues, remappable controls, adjustable game speed, stronger contrast options, and alternatives for time-sensitive actions.

## Browser compatibility

Use a current version of a browser with WebGL and JavaScript-module support, such as:

- Chrome
- Edge
- Firefox
- Safari

Performance depends on the device's graphics hardware. The renderer limits pixel density to reduce GPU load on high-resolution displays.

## Troubleshooting

### The page loads but the 3D scene is missing

- Confirm that the device and browser support WebGL.
- Open the browser developer console and look for errors.
- Confirm that the browser can reach `cdn.jsdelivr.net`.
- Run the project through an HTTP server instead of opening it with `file://`.

### The page remains on the loading screen

The Three.js module probably failed to load. Check the internet connection, content-blocking extensions, and browser console.

### Movement keys scroll the page

Select **Enter the world** before using the controls. The game suppresses arrow-key and Space scrolling while gameplay is active.

### The player continually misses platforms

The prototype uses automatic forward motion. Begin planning the next jump before reaching the edge, and use lateral movement while airborne.

### Sound does not start immediately

Browsers require user interaction before creating or resuming an audio context. Select the sound control after the page has loaded.

## Production roadmap

Potential next steps include:

- Multiple levels and checkpoints
- A dedicated physics engine
- Controller remapping
- Pause, settings, and accessibility menus
- Music and production sound effects
- Imported character and environment models
- Animation blending
- Save data and completion records
- Performance settings
- Automated browser testing
- Offline bundling of Three.js and fonts
- A native Godot version for desktop distribution

## Native game version

This browser prototype can remain the promotional website and interactive demo for a future native game. A Steam-targeted version should be developed separately in an engine such as Godot. Game logic and visual concepts can be reused as references, but Three.js source code cannot be directly imported as native Godot gameplay code.

## License

No project license has been selected yet. Until a license file is added, normal copyright protections apply and reuse is not automatically granted. Choose a license before inviting external contributions or distributing reusable source code.
