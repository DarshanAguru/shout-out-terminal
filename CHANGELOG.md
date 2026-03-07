# Change Log

All notable changes to the "shout-out-terminal" extension will be documented in this file.

## [0.1.1] - 2026-03-07

### Changed
- **Metrics Dashboard UI Upgrade**: Completely redesigned the "Track Record" Activity Sidebar webview. It now features a responsive grid layout, dynamic hover interactions, staggered entrance animations, and a modern glassmorphism aesthetic.
- **Sidebar Icon Fix**: Fixed an issue where the SVG sidebar icon (`sidebar-icon.svg`) would render incorrectly or as a solid block because of missing width and height attributes, and ensuring the `views` configurations point to the SVG instead of the old PNG.

## [0.1.0] - 2026-03-07

### Added
- **Gamified Statistics Dashboard**: Added a massively customized HTML Webview to the Activity Sidebar. Fully interactive, persistently tracking all underlying Terminal events so you can gamify your daily Developer Health.
- **Dedicated Terminal Architecture**: Re-engineered the stream parsers to completely ignore all VS Code terminals by default! You must now explicitly run `Shout Out Terminal: Open Terminal` to spawn the isolated sandbox. No more accidental audio spam!
- **Accurate Graphics**: Completely overhauled the tiny logo PNG into a massive, gorgeous, fully scalable SVG icon (`media/sidebar-icon.svg`) representing a Terminal Megaphone emitting sound waves. Perfect dark/light mode integration.
- **Bi-Directional Sync**: The UI sidebar automatically re-renders and counts up whenever an audio event strikes without any gross DOM re-paints.

### Fixed
- **Windows System Audio**: Destroyed the broken `play-sound` dependency on `win32` platforms. Rewrote the Windows adapter to natively call `powershell (New-Object Media.SoundPlayer)` seamlessly fixing broken `.wav` headers.
- **Concurrency Overlap Eliminator**: Annoyed by walls of overlapping chaotic noise? Reprogrammed `src/utils/audio.ts` to aggressively manage singletons. If an error sound triggers mid-sentence, it throws a hardcore SIGKILL/taskkill against the node process, muting the old audio instantly before resolving the new sound.
- **Mature Mode Regex Bugs**: Fixed a massive flaw where Mature Mode just blindly returned "Error" for everything. It now accurately parses `syntax_errors`, `build_failures`, and `warnings` strictly sequentially.

## [0.0.1] - Initial Release
- Initial prototype.