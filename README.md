<p align="center">
  <img src="https://raw.githubusercontent.com/Lucineer/capitaine/master/docs/capitaine-logo.jpg" alt="Cocapn" width="120">
</p>

<h1 align="center">Constraint Theory</h1>

<p align="center">
  A computational constraint solving framework in Rust and WebAssembly for agent reasoning with bounded perspectives.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#the-fleet">The Fleet</a> ·
  <a href="https://github.com/Lucineer/capitaine">Capitaine</a>
</p>

---

Constraint Theory provides a way to define and solve constraints within a multi-agent system. Instead of granting agents omniscient access to a shared state, it enforces a first-person perspective where agents can only observe and act according to a defined set of constraints.

This approach aims to reduce system failures by making constraint violations and partial information a core part of the computational model, not an afterthought.

## What It Does

| | Traditional Solvers | Constraint Theory |
|---|---|---|
| Perspective | Global, shared view | First-person, per agent |
| Primary Goal | Find a global solution | Find solutions valid for a given agent's view |
| State Model | Shared, mutable | Derived per observer |
| On Contradiction | Often fails | Continues with partial information |

### Features
* Core engine written in Rust, compiled to WebAssembly for portability.
* Library of 1376 formal constraint primitives for logical, temporal, and access control rules.
* Constraints are explicit, forkable, and overrideable.
* Integrates with Git, using the commit graph as an audit trail.
* MIT-licensed; runs on your infrastructure.

### Limitation
The framework requires all constraints to be explicitly defined upfront. Emergent or learned constraints during runtime are not currently supported.

## Quick Start

Fork the repository first. This is designed to be modified, not used as a black-box dependency.

```bash
git clone https://github.com/Lucineer/constraint-theory.git
cd constraint-theory
cargo build
```
Refer to the repository's `SETUP.md` for runtime-specific configuration.

## The Fleet

Constraint Theory is part of the Cocapn Fleet. Each vessel is an open-source, git-native component.

<details>
<summary><strong>⚓ The Fleet</strong></summary>

**Flagship vessels**
- [Capitaine (flagship)](https://github.com/Lucineer/capitaine)
- [personallog-ai](https://github.com/Lucineer/personallog-ai)
- [businesslog-ai](https://github.com/Lucineer/businesslog-ai)
- [studylog-ai](https://github.com/Lucineer/studylog-ai)
- [makerlog-ai](https://github.com/Lucineer/makerlog-ai)
- [playerlog-ai](https://github.com/Lucineer/playerlog-ai)
- [dmlog-ai](https://github.com/Lucineer/dmlog-ai)
- [reallog-ai](https://github.com/Lucineer/reallog-ai)
- [deckboss-ai](https://github.com/Lucineer/deckboss-ai)

**Fleet services**
- [Git-Agent (minimal)](https://github.com/Lucineer/git-agent)
- [Whisper-Server](https://github.com/Lucineer/whisper-server)
- [Filesystem-Agent](https://github.com/Lucineer/filesystem-agent)
- [Zap-Agent](https://github.com/Lucineer/zap-agent)
- [Browser-Agent](https://github.com/Lucineer/browser-agent)
- [Bash-Agent](https://github.com/Lucineer/bash-agent)
- [Keyboard-Agent](https://github.com/Lucineer/keyboard-agent)
- [Click-Agent](https://github.com/Lucineer/click-agent)
- [Ask-Agent](https://github.com/Lucineer/ask-agent)
- [Runner-Agent](https://github.com/Lucineer/runner-agent)
- [Telegram-Agent](https://github.com/Lucineer/telegram-agent)
- [Discord-Agent](https://github.com/Lucineer/discord-agent)
- [Slack-Agent](https://github.com/Lucineer/slack-agent)
- [Email-Agent](https://github.com/Lucineer/email-agent)
- [RSS-Agent](https://github.com/Lucineer/rss-agent)
- [Cron-Agent](https://github.com/Lucineer/cron-agent)
- [GitHub-Agent](https://github.com/Lucineer/github-agent)

**Developer tools**
- [Autocommit](https://github.com/Lucineer/autocommit)
- [Fleet-Engine](https://github.com/Lucineer/fleet-engine)
- [Superinstance](https://github.com/Lucineer/superinstance)

**Research & prototypes**
- [Paper-Fleet](https://github.com/Lucineer/paper-fleet)
- [AI-Wars](https://github.com/Lucineer/ai-wars)
- [Starfleet](https://github.com/Lucineer/starfleet)

</details>

<div align="center">
  <br>
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> •
  <a href="https://cocapn.ai">Cocapn</a>
  <br><br>
  <sub>Attribution: Superinstance & Lucineer (DiGennaro et al.). MIT Licensed. Cloudflare Workers.</sub>
</div>