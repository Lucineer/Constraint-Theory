# Constraint Theory 🎯

You watch agents fight over a single shared global state and wonder: why does every multi-agent system work this way? Constraint Theory offers a different approach.

Each agent operates within its own first-person perspective, defined by a spreadsheet-like SuperInstance. There is no omniscient, shared state. Constraint violations are not bugs—they are a core part of the computation.

**Live Demo:** [constraint-theory.casey-digennaro.workers.dev](https://constraint-theory.casey-digennaro.workers.dev)

## Why This Exists

Multi-agent tools typically assume all actors see an identical world. In reality, people and teams have different viewpoints and permissions. This project bakes that reality into the model. You define the shape of what each agent can perceive and act upon through constraints, instead of adding permission layers on top of a monolithic state.

## Quick Start

This project is fork-first. You are expected to modify and extend it, not treat it as a sealed library.

1.  **Fork** this repository.
2.  Deploy it directly to [Cloudflare Workers](https://workers.cloudflare.com), or run it locally with `cargo build`.
3.  Edit constraints and agent perspectives within the SuperInstance code.

## Features

*   **First-Person Agent Views:** An agent only sees and interacts with data its constraints permit. There is no global omniscience.
*   **Defined Constraint Primitives:** Provides 1,376 formal primitives for defining logic, timing, access, and data boundaries.
*   **Intentional View Forking:** You can fork any agent's perspective at any point to create a divergent branch, with no side effects on other agents.
*   **Git-Native Audit Trail:** Every constraint change exists in your Git commit history.
*   **Zero Runtime Dependencies:** The entire system runs on Cloudflare Workers with no external packages.
*   **MIT Licensed:** Use, modify, and distribute without restriction.

## What Makes This Different

1.  **No Hidden Global State:** The system does not start with a complete world state and then add filters. The state itself is different for each agent from the ground up.
2.  **Violations Are Not Errors:** When an agent encounters a constraint, it's a valid computational outcome. You build logic to handle these moments.
3.  **Forking is a Feature:** Branching agent perspectives is a deliberate, supported action, not an architectural accident.

## Limitations

All constraints must be explicitly defined in code before runtime. The system cannot currently learn or infer new constraints dynamically from agent behavior.

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>