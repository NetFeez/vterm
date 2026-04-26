# @netfeez/vterm

> Advanced TUI components and logging infrastructure for the NetFeez ecosystem

`@netfeez/vterm` is a high-performance vterm User Interface (TUI) toolkit. It provides everything needed to build beautiful, interactive, and professional CLI applications, from a multi-stream logger with hex/rgb support to interactive debug consoles.

---

## 🚩 Key Features

- **Rich Text Formatting:** Support for standard colors, RGB, and Hex directly in strings (e.g., `&C(#FFB4DC)`).
- **Interactive DebugUI:** A real-time command-line interface inside your application for hot-debugging.
- **Smart Logging:** Multi-instance `LoggerCore` with automatic file streaming, log rotation support, and custom formatting.
- **Asynchronous I/O:** Non-blocking log streams that won't slow down your application's main loop.
- **Developer Centric:** Built by developers for developers, focusing on readability and terminal aesthetics.

---

## 🧩 Package Structure

- **src/logger/** — The heart of the logging system (`Logger`, `LoggerCore`, `LoggerStream`).
- **src/ui/ConsoleUI.ts** — Low-level text formatting engine and ANSI escape management.
- **src/ui/DebugUI.ts** — Interactive command-line interface for real-time interaction.
- **src/logger/Formatter.ts** — Customizable log line builder with object inspection.

---

## 🌐 NetFeez Ecosystem Integration

This package provides the visual and diagnostic layer for the stack:
- [Vortez](https://github.com/NetFeez/vortez): Uses this package for its entire system output and developer console.

---

## 📦 Installation

```bash
npm install @netfeez/vterm
```
