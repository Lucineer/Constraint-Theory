# HN Launch Quick Reference

**For immediate use during launch - copy-paste ready responses**

---

## Titles (Choose ONE)

**Recommended:**
```
Show HN: Constraint Theory – Deterministic geometric engine for vector computations (Rust)
```

**Alternative (Performance):**
```
Show HN: Constraint Theory – Rust engine snapping vectors to Pythagorean lattices at 13.5M ops/sec
```

**Alternative (Safety):**
```
Show HN: Constraint Theory – A deterministic alternative to stochastic matrix ops (open source Rust)
```

---

## Post Text (Copy This)

```
Hi HN,

I've been working on Constraint Theory, an open-source Rust engine that replaces some stochastic matrix operations with deterministic geometric constraint solving.

Instead of sampling from continuous distributions and accepting approximate solutions, this library works over a discrete geometric manifold (currently a Pythagorean lattice) and only returns states that satisfy the constraints.

Concretely, the current implementation does:

* Pythagorean snapping: Snap continuous 2D vectors in R² onto a lattice of Pythagorean triples (3–4–5, 5–12–13, 8–15–17) using a KD-tree index.
* Deterministic outputs: Given a constraint set, it only returns states from the allowed manifold.
* Performance: On a 200-point manifold benchmark, the Rust + KD-tree implementation runs at 0.074 µs/op (~13.5M ops/sec), about 280× faster than a NumPy baseline.

Repo: https://github.com/SuperInstance/Constraint-Theory
Demo: https://constraint-theory.superinstance.ai/simulators/pythagorean

Right now it's early but usable:

* Rust crate with a PythagoreanManifold and snap() API
* Interactive web visualizer: https://constraint-theory.superinstance.ai/simulators/pythagorean
* Math docs covering the "zero hallucination" theorem, complexity guarantees, and geometric interpretation

About "zero hallucination": I mean it formally never returns an output that violates the constraints of its manifold (details and proofs are in the repo), not that LLMs magically stop being wrong.

I'd particularly love feedback on:

1. Conceptual clarity – Does the geometric framing make sense? How would you explain it better?
2. Use cases – Where (if anywhere) would you consider using this in an ML/optimization pipeline?
3. Skepticism – Which claims seem least convincing or most in need of better docs?

Happy to answer detailed questions about the math, benchmarks, or implementation.
```

---

## Quick FAQ Responses

### "What's zero hallucination?"

```
"Zero hallucination" has a precise definition: The system never returns a state that violates the constraint manifold. Formally: P(hallucination) = 0, where "hallucination" means "returning g ∉ G where G is valid states."

It means every output satisfies the constraints. It doesn't mean this solves all AI problems or makes LLMs perfect. Just that for this specific geometric operation, constraint violations are mathematically impossible.

Full proof: https://github.com/SuperInstance/Constraint-Theory/blob/main/docs/THEORETICAL_GUARANTEES.md
```

### "Is the benchmark fair?"

```
Fair question. We compared against naive NumPy nearest neighbor search (brute force O(n)). The speedup comes from:

1. KD-tree O(log n) vs brute force O(n)
2. Compiled Rust vs Python overhead
3. Spatial indexing vs linear scan

Benchmark code is in BASELINE_BENCHMARKS.md - you can reproduce it. Not claiming "Rust is always faster" - just showing spatial indexing + compiled code helps for this problem.

Happy to add comparisons (faiss, scipy.spatial, etc.) if suggested.
```

### "Isn't this just quantization?"

```
Short answer: Core operation is nearest-neighbor on KD-tree (well-known). Novel part is the geometric framework:

- Standard: Quantization for compression
- This: Constraint satisfaction (only valid states)

Novel contributions:
1. Geometric constraint framework (manifold navigation vs approximation)
2. Rigidity-curvature duality theorem (proved)
3. Holonomy-information equivalence (proved)
4. Φ-folding operator for continuous→discrete mapping

It's early research - not claiming it revolutionizes everything. Just an interesting geometric approach for specific problems.
```

### "Where would I use this?"

```
Honest answer: Still figuring this out. Potential use cases:

1. Numerical stability (robotics, graphics, physics)
2. Deterministic ML pipelines (safety-critical systems)
3. Educational (visualizing geometric constraints)
4. Research platform for geometric computation

Limitations:
- Only 2D currently (3D in progress)
- Specific constraint types only
- Not a general matrix replacement
- Rust-only (Python bindings planned)

Where it doesn't make sense:
- General-purpose ML
- Problems without geometric constraints
- When approximation is fine

Looking for collaborators with real-world problems to test.
```

### "Python bindings?"

```
Not yet, but planned. Current status:

- Rust crate: Production-ready
- TypeScript API: In development
- Python bindings: Roadmap

Why Rust first:
- Performance critical (74 ns/op target)
- Memory safety for correctness proofs
- SIMD/CUDA integration easier

Timeline: Q2 2026 if there's community interest. Star the repo if you'd use Python bindings - helps prioritize.

Workaround: Can call Rust binary from Python via subprocess (not ideal, but works).
```

### "Peer reviewed?"

```
Not yet in traditional academic sense. Current status:

- 150+ pages of mathematical documentation
- Complete proofs for core theorems
- Open-source code with verified performance
- Not yet submitted to venues

Why open-source first:
1. Get community feedback early
2. Prove practical utility before publication
3. Invite collaboration
4. Academic publication planned this year

All proofs are in THEORETICAL_GUARANTEES.md - you don't have to trust me, the math is there to check. Would welcome mathematical scrutiny.

Target venues: NeurIPS, ICML, JMLR. Seeking collaboration with research institutions.
```

### "Business model?"

```
Open-source core with potential enterprise features.

Philosophy:
- Constraint theory is fundamental - should be free
- Core Rust crate remains open-source (MIT)
- Community contributions welcome

Potential future revenue:
1. Enterprise features (SaaS, support SLAs)
2. Consulting (custom constraint solving)
3. Training (workshops, certification)
4. Proprietary extensions (non-core)

Current priority: Prove utility, build community. Revenue comes later if there's demand.

Why open-source:
- Geometric computation too fundamental to be proprietary
- Community will take this farther than one company
- Aligns with academic tradition
- "Science works best when ideas are free"
```

---

## Response Templates

### Skepticism
```
Thanks for the skepticism - you're right to question this.

Precise definition: [link]. Key assumption: [explain]. Limitation: [be honest].

Would you suggest I rephrase [X] as [Y] to be clearer?
```

### Technical Interest
```
Great question! Here's how it works:

[detailed explanation]

Demo: [link]. Docs: [link]. Let me know if you want me to go deeper.
```

### Criticism
```
You raise a good point. I think the confusion comes from [explain].

Let me update the README - actually just pushed a change: [commit]. Does that help?

I'm trying to be precise about what this is AND isn't. Marketing got ahead of reality in places - fixing that.
```

### "Just Use X"
```
You're right that [X] is great for [use case]. The reason I built this is for [specific scenario].

Example: [concrete example]

Not trying to replace [X] - just offering alternative for certain problems. Ever encounter cases where deterministic geometric constraints would help?
```

---

## Key Links (Keep Open)

- Repo: https://github.com/SuperInstance/Constraint-Theory
- Demo: https://constraint-theory.superinstance.ai/simulators/pythagorean
- Proofs: https://github.com/SuperInstance/Constraint-Theory/blob/main/docs/THEORETICAL_GUARANTEES.md
- Benchmarks: https://github.com/SuperInstance/Constraint-Theory/blob/main/docs/BASELINE_BENCHMARKS.md
- Math: https://github.com/SuperInstance/Constraint-Theory/blob/main/docs/MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md

---

## Launch Reminders

### DO
- Respond quickly (within 5 minutes)
- Be humble and detailed
- Link to docs/code/proofs
- Acknowledge limitations
- Engage with curiosity
- Thank people for feedback

### DON'T
- Argue with skeptics
- Be defensive
- Make absolute claims
- Attack alternatives
- Ignore questions
- Get emotional

### Tone Guide
- "Here's what we built" not "Here's the perfect solution"
- "We'd love feedback" not "We figured it all out"
- "This is early research" not "This is production-ready for everything"
- "Help us understand" not "Let us explain why you're wrong"

---

## Success Signals

### Good Signs
- Substantive technical questions
- People cloning repo
- GitHub stars increasing
- Offers to collaborate
- Good-faith skepticism
- Repeat engagement from same users

### Red Flags
- "This is pure hype" (respond with proofs/code)
- Site crashes (be transparent, use GitHub fallback)
- Technical misunderstandings (clarify patiently)
- Competitor attacks (stay professional, focus on results)

---

## If Things Go Wrong

### Site Down
```
Thanks for the interest - our demo is getting hammered! 🎉

All the code and docs are on GitHub (link above) so you can still explore. The demo will be back up soon - we're scaling up.

In the meantime, check out the README and benchmarks!
```

### Heavy Criticism
```
I hear you - let me address this point by point:

[Address each criticism specifically]

You're right to push back on [X]. Let me update the docs to be clearer about this. What would make it more convincing to you?

Appreciate the tough questions - this is exactly the feedback we need.
```

### Low Engagement
```
If the post doesn't gain traction:
- It happens - timing and luck matter
- Don't take it personally
- Learn from it
- Try again in 2 weeks with refined messaging
- Focus on technical blogs instead
- Continue development regardless
```

---

## Final Checklist Before Submitting

- [ ] Read post aloud (flows naturally?)
- [ ] All links work
- [ ] Demo loads
- [ ] Tone is humble
- [ ] Claims are precise
- [ ] "Zero hallucination" defined
- [ ] Ready to respond quickly
- [ ] Open mind about feedback
- [ ] Prepared for skepticism
- [ ] Ready to learn and improve

---

**Remember: The goal is genuine conversation with smart people, not to "win" HN.**

**Good luck! 🚀**
