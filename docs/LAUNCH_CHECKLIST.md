# HN Launch Checklist

**Use this checklist before, during, and after the HN launch**

---

## 1 Hour Before Launch

### Technical Verification
- [ ] All links in HN post work
- [ ] Demo loads and functions correctly
- [ ] README renders properly on GitHub
- [ ] All tests pass (`cargo test`)
- [ ] Benchmarks run successfully
- [ ] No broken links in docs

### Content Verification
- [ ] HN post is under 300 words
- [ ] Tone is humble, not arrogant
- [ ] Claims are precise and qualified
- [ ] "Zero hallucination" is clearly defined
- [ ] Limitations are acknowledged
- [ ] Contact info is correct

### Team Readiness
- [ ] Moderator(s) assigned and online
- [ ] Response templates open in tabs
- [ ] Key links bookmarked
- [ ] Backup plan ready (GitHub README)
- [ ] Mindset: curious, not defensive

---

## Launch Time (GO!)

### Submit HN Post
**Recommended Title:**
```
Show HN: Constraint Theory – Deterministic geometric engine for vector computations (Rust)
```

**Post Text:** Copy from `docs/HN_QUICK_REFERENCE.md`

### Immediately After Submitting
- [ ] Monitor for first comment
- [ ] Prepare first response (should be welcoming)
- [ ] Check demo is still working
- [ ] Take a deep breath 🧘

---

## First Hour (Critical Period)

### Engagement Protocol
- [ ] Respond to every comment within 5 minutes
- [ ] Be humble and detailed
- [ ] Link to docs/code/proofs liberally
- [ ] Acknowledge limitations openly
- [ ] Don't argue, engage with curiosity

### Red Flag Responses
- [ ] "This is hype" → Link to proofs/code
- [ ] "Benchmark unfair" → Explain methodology
- [ ] "Just quantization" → Acknowledge + explain novelty
- [ ] "Where to use?" → Be honest about exploration

### Success Signals to Watch
- [ ] Substantive technical questions
- [ ] People cloning repo
- [ ] GitHub stars increasing
- [ ] Good-faith skepticism
- [ ] Offers to collaborate

---

## First 4 Hours (Peak Engagement)

### Maintain Quality
- [ ] Keep response time under 10 minutes
- [ ] Update README based on feedback
- [ ] Clarify confusing points
- [ ] Add FAQs from questions
- [ ] Thank people for feedback

### If Things Go Well
- [ ] Pin the most interesting technical discussion
- [ ] Welcome new contributors
- [ ] Create "good first issue" tickets
- [ ] Update demo if issues found
- [ ] Document what's resonating

### If Things Go Poorly
- [ ] Stay calm and professional
- [ ] Address criticisms with data
- [ ] Acknowledge what's valid
- [ ] Don't get defensive
- [ ] Learn from it

---

## End of Day 1

### Review and Document
- [ ] Top comments summary
- [ ] Common questions identified
- [ ] Criticisms to address
- [ ] Features requested
- [ ] Collaborators found

### Immediate Actions
- [ ] Thank top contributors
- [ ] Update README with clarifications
- [ ] Create issues for feature requests
- [ ] Respond to any remaining comments
- [ ] Celebrate! 🎉

### Metrics to Track
- [ ] Total upvotes
- [ ] Total comments
- [ ] GitHub stars gained
- [ ] Repo clones
- [ ] Demo visits
- [ ] Issues filed

---

## Day 2-3: Follow-up

### Content Creation
- [ ] Write "Day 1 Learnings" post
- [ ] Address top criticisms in README
- [ ] Add requested documentation
- [ ] Fix any bugs discovered
- [ ] Share metrics (if positive)

### Community Building
- [ ] Reach out to potential collaborators
- [ ] Invite contributors to Discord (if exists)
- [ ] Respond to GitHub issues
- [ ] Review and merge PRs
- [ ] Plan next sprint

---

## Week 1: Momentum

### Based on Feedback
- [ ] Prioritize most requested features
- [ ] Clarify confusing documentation
- [ ] Add examples for common use cases
- [ ] Improve demo based on suggestions
- [ ] Write tutorial for new users

### Community Engagement
- [ ] Host AMA (if there's interest)
- [ ] Contributor spotlight posts
- [ ] Share community projects
- [ ] Plan in-person/virtual meetup
- [ ] Prepare conference submissions

### Academic Outreach
- [ ] Contact interested researchers
- [ ] Prepare paper preprints
- [ ] Submit to relevant venues
- [ ] Plan reproducibility packages
- [ ] Document theoretical contributions

---

## Ongoing: Success Metrics

### Technical Health
- [ ] Tests passing
- [ ] Benchmarks stable
- [ ] Dependencies updated
- [ ] Documentation current
- [ ] Issues addressed

### Community Health
- [ ] Active contributors
- [ ] Helpful discussions
- [ ] PRs being reviewed
- [ ] New use cases emerging
- [ ] Positive sentiment

### Project Growth
- [ ] Stars increasing
- [ ] Forks for experimentation
- [ ] Production deployments
- [ ] Academic citations
- [ ] Industry interest

---

## If Site Crashes

### Immediate Response
```
"Thanks for the interest! Our demo is getting hammered! 🎉

All the code and docs are on GitHub so you can still explore.
The demo will be back up soon - we're scaling up.

In the meantime, check out the README and benchmarks!"
```

### Technical Actions
- [ ] Check Cloudflare logs
- [ ] Enable auto-scaling
- [ ] Add caching if needed
- [ ] Update HN with status
- [ ] Monitor for recovery

---

## If Reception is Negative

### Common Scenarios

**"This is pure hype"**
→ Respond with proofs, benchmarks, code
→ Be transparent about limitations
→ Don't argue, provide evidence

**"Benchmark is unfair"**
→ Explain methodology clearly
→ Acknowledge what it's NOT claiming
→ Offer to add more comparisons
→ Invite suggestions

**"Just quantization"**
→ Acknowledge kernel is standard
→ Explain novel contributions
→ Don't overstate novelty
→ Focus on geometric framework

**"No practical use"**
→ Agree it's early research
→ Ask for suggestions
→ Be honest about exploration
→ Invite collaboration

---

## If Reception is Positive

### Capitalize on Momentum

**Offers to collaborate**
→ Create issue tracker
→ Define onboarding process
→ Start with small tasks
→ Document contributions

**Press interest**
→ Prepare technical briefings
→ Schedule demos
→ Provide screenshots
→ Follow up promptly

**Academic interest**
→ Share proofs and derivations
→ Discuss joint research
→ Plan paper submissions
→ Offer reproducibility packages

**Production interest**
→ Document API clearly
→ Provide integration guides
→ Offer support channels
→ Gather feedback

---

## Post-Launch Retrospective (Week 2)

### Questions to Ask
1. What went well?
2. What surprised us?
3. What was misunderstood?
4. What should we build next?
5. How can we improve?

### Actions to Take
- [ ] Document lessons learned
- [ ] Update roadmap based on feedback
- [ ] Improve weak areas
- [ ] Double down on strengths
- [ ] Plan next launch phase

---

## Launch Reminders

### DO
✓ Respond quickly and thoughtfully
✓ Be humble and detailed
✓ Link to docs/code/proofs
✓ Acknowledge limitations
✓ Engage with curiosity
✓ Thank people for feedback
✓ Learn from criticism
✓ Have fun!

### DON'T
✗ Argue with skeptics
✗ Be defensive
✗ Make absolute claims
✗ Attack alternatives
✗ Ignore questions
✗ Get emotional
✗ Over-promise
✗ Take it personally

### Tone Guide
- "Here's what we built" not "Here's the perfect solution"
- "We'd love feedback" not "We figured it all out"
- "This is early research" not "This is production-ready for everything"
- "Help us understand" not "Let us explain why you're wrong"

---

## Final Checklist

### Before Submitting
- [ ] Read post aloud (flows naturally?)
- [ ] All links tested
- [ ] Demo working
- [ ] Tone humble
- [ ] Claims precise
- [ ] Limitations acknowledged
- [ ] Mindset ready
- [ ] Response templates open

### After Submitting
- [ ] Monitor comments
- [ ] Respond quickly
- [ ] Stay humble
- [ ] Learn and adapt
- [ ] Enjoy the ride!

---

**Remember: The goal is genuine technical conversation, not to "win" HN. Good luck! 🚀**

---

**Last Updated:** 2026-03-16
**Status:** Ready for Launch
**Next:** Submit HN post and engage authentically!
