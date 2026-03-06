# Shout Out Terminal 🔊

![Shout Out Terminal Banner](media/banner.png)

**Your terminal talks back!** Get instant audio feedback for errors, build results, test outcomes, and perfectly track your developmental health natively inside a gamified VS Code Sidebar!

[![Version](https://img.shields.io/badge/version-0.1.0-007ACC?style=for-the-badge&logo=visual-studio-code)](#)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge)](#-cross-platform-support)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE.txt)

---

### 🔊 Stop straining your eyes. Start using your ears.
*Shout Out Terminal* transforms your coding experience by adding a layer of audio awareness to your development workflow. No more context switching or scrolling back to check if your long-running build finally finished. We’ve meticulously crafted robust singletons to prevent audio overlap—just clean, instant context cues!

[Installation](#-manual-installation-vsix) • [Features](#-features) • [Configuration](#-configuration) • [Audio Matrix](#-event-sounds-matrix) • [Author](#-about-the-author)

---

## 💿 Manual Installation (VSIX)

Currently, the `0.1.0` release is designed for manual offline installation.

1. Download or locate `shout-out-terminal-0.1.0.vsix`.
2. Open VS Code.
3. Open the **Extensions** View (`Ctrl+Shift+X` / `Cmd+Shift+X`).
4. Click the **`...`** menu in the top right corner of the Extensions view.
5. Select **`Install from VSIX...`** and choose your file.

---

## ✨ Features

- **🛡️ Dedicated Isolation**: Shout Out values your privacy! It **only** listens to its own dedicated terminal.
  - Run **`Shout Out Terminal: Open Terminal`** in your Command Palette to spawn the isolated instance!
- **🏆 Gamified Sidebar Dashboard**: Click the Shout Out logo in your Activity Bar to track your "Developer Health". Watch metrics dynamically tick up as tests pass or fail!
- **⚡ Real-time Feedback (Amature Mode)**: Hear sounds immediately as patterns are detected in your stream.
- **📊 Summary Feedback (Mature Mode)**: Get a single intelligent summary sound once your command process fully exits.
- **🧠 Zero Audio Clutter**: Built-in native OS-level audio process-killing ensures sounds instantly cut each other off smoothly without colliding into a noisy mess.

---

## ⚙️ Configuration

Customize how the terminal talks back in your VS Code settings under `Shout Out Terminal`.

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `shout-out-terminal.mode` | `string` | `"amature"` | `"amature"` (real-time stream) or `"mature"` (wait for exit summary) |

> [!TIP]
> **Amature Mode** is best for active debugging and fast iteration.  
> **Mature Mode** is perfect for long-running builds and background processes.

---

## 🛠️ Supported Languages & Tools

Built to handle the modern developer's toolkit completely out of the box!

- **Languages**: Node.js, Python, Java, TypeScript, Rust, Go, .NET, C/C++
- **Build Systems**: npm, yarn, Maven, Gradle, webpack, vite, esbuild, cargo, make, cmake
- **Test Runners**: Jest, Mocha, Vitest, pytest, unittest, JUnit, Go test, Cargo test

### 🎵 Event Sounds Matrix

| Event | Audio Cue | Condition |
| :--- | :--- | :--- |
| **Error** | ⚠️ Alert | Runtime exceptions, fatal crashes |
| **Syntax Error** | 🧩 Click | Lints, compilation errors |
| **Build Success** | 🎉 Chime | Successful build/compilation |
| **Test Passed** | ✅ Success | All tests passing |
| **Test Failed** | ❌ Fail | Any test suite failure |
| **System Exit** | 🚪 Door | Process finished / exit code |

---

## 💻 Cross-Platform Support

We ensure compatibility by using native system players for zero-latency playback.

| OS | Backend Player | Requirement |
| :--- | :--- | :--- |
| **Windows** | `powershell` | Native Windows (`New-Object Media.SoundPlayer`) |
| **macOS** | `afplay` | Built-in macOS Audio Engine |
| **Linux** | `aplay` | `alsa-utils` (usually pre-installed) |

---

## 👤 About the Author

Built with ❤️ by **Darshan Aguru**. 

Passionate about building tools that enhance developer productivity and accessibility.

[![Portfolio](https://img.shields.io/badge/Portfolio-thisdarshiii.in-purple?style=for-the-badge&logo=google-chrome&logoColor=white)](https://thisdarshiii.in)
[![GitHub](https://img.shields.io/badge/GitHub-DarshanAguru-black?style=for-the-badge&logo=github)](https://github.com/DarshanAguru)

---

### 📝 Support & Contribution

💬 If you find this gamified extension useful, consider giving it a ⭐ on [GitHub](https://github.com/DarshanAguru/shout-out-terminal). Found a bug or want to request a feature? Open an issue!

[Open an Issue](https://github.com/DarshanAguru/shout-out-terminal/issues) • [View Repository](https://github.com/DarshanAguru/shout-out-terminal)
