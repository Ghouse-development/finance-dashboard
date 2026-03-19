---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks—they transform Claude from a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - Instructions for working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex and repetitive tasks

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (required)

**Metadata Quality:** The `name` and `description` in YAML frontmatter determine when Claude will use the skill. Be specific about what the skill does and when to use it. Use the third-person (e.g. "This skill should be used when..." instead of "Use this skill when...").

##### YAML Frontmatter Reference

All frontmatter fields except `description` are optional. Configure skill behavior using these fields between `---` markers:

```yaml
---
name: my-skill
description: What this skill does and when to use it. Use when...
context: fork
agent: Explore
disable-model-invocation: true
allowed-tools: Read, Grep, Bash(git *)
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name for the skill. If omitted, uses the directory name. Lowercase letters, numbers, and hyphens only (max 64 characters). |
| `description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply the skill. If omitted, uses the first paragraph of markdown content. |
| `context` | No | **Set to `fork` to run in a forked subagent context.** This is critical for skills that should be available to subagents spawned via the Task tool. Without `context: fork`, the skill runs inline in the main conversation. |
| `agent` | No | Which subagent type to use when `context: fork` is set. Options: `Explore`, `Plan`, `general-purpose`, or custom agents from `.claude/agents/`. Default: `general-purpose`. |
| `disable-model-invocation` | No | Set to `true` to prevent Claude from automatically loading this skill. Use for workflows you want to trigger manually with `/name`. Default: `false`. |
| `user-invocable` | No | Set to `false` to hide from the `/` menu. Use for background knowledge users shouldn't invoke directly. Default: `true`. |
| `allowed-tools` | No | Tools Claude can use without asking permission when this skill is active. Supports wildcards: `Read, Grep, Bash(git *)`, `Bash(npm *)`, `Bash(docker compose *)`. |
| `model` | No | Model to use when this skill is active. |
| `argument-hint` | No | Hint shown during autocomplete to indicate expected arguments. Example: `[issue-number]` or `[filename] [format]`. |
| `hooks` | No | Hooks scoped to this skill's lifecycle. Example: `hooks: { pre-invoke: [{ command: "echo Starting" }] }`. See Claude Code Hooks documentation. |

**Special placeholder:** `$ARGUMENTS` in skill content is replaced with text the user provides after the skill name. For example, `/deep-research quantum computing` replaces `$ARGUMENTS` with `quantum computing`.

##### When to Use `context: fork`

Use `context: fork` when the skill:
- Performs multi-step autonomous tasks (research, analysis, code generation)
- Should be available to subagents spawned via the Task tool
- Needs isolated context that won't pollute the main conversation
- Contains explicit task instructions (not just guidelines or reference content)

##### Invocation Control

| Frontmatter | You can invoke | Claude can invoke | Subagents can use |
|-------------|----------------|-------------------|-------------------|
| (default) | Yes | Yes | No (runs inline) |
| `context: fork` | Yes | Yes | Yes |
| `disable-model-invocation: true` | Yes | No | No |
| `context: fork` + `disable-model-invocation: true` | Yes | No | Yes (when explicitly delegated) |

#### Bundled Resources (optional)

##### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Benefits**: Token efficient, deterministic, may be executed without loading into context

##### References (`references/`)

Documentation and reference material intended to be loaded as needed into context to inform Claude's process and thinking.

- **When to include**: For documentation that Claude should reference while working
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md

##### Assets (`assets/`)

Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Benefits**: Separates output resources from documentation, enables Claude to use files without loading them into context

### Progressive Disclosure Design Principle

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (Unlimited*)

*Unlimited because scripts can be executed without reading into context window.

## Skill Creation Process

To create a skill, follow the "Skill Creation Process" in order, skipping steps only if there is a clear reason why they are not applicable.

### Step 1: Understanding the Skill with Concrete Examples

To create an effective skill, clearly understand concrete examples of how the skill will be used. Ask the user questions like:

- "What functionality should the skill support?"
- "Can you give some examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

Conclude this step when there is a clear sense of the functionality the skill should support.

### Step 2: Planning the Reusable Skill Contents

Analyze each example by:

1. Considering how to execute on the example from scratch
2. Determining the appropriate level of freedom for Claude
3. Identifying what scripts, references, and assets would be helpful

**Match specificity to task risk:**
- **High freedom (text instructions)**: Multiple valid approaches exist
- **Medium freedom (pseudocode with parameters)**: Preferred patterns exist with acceptable variation
- **Low freedom (exact scripts)**: Operations are fragile, consistency critical

### Step 3: Initializing the Skill

Create the skill directory structure:

```
skill-name/
├── SKILL.md
├── scripts/      (optional)
├── references/   (optional)
└── assets/       (optional)
```

Place it in:
- `~/.claude/skills/<skill-name>/` for personal skills
- `.claude/skills/<skill-name>/` for project-specific skills

### Step 4: Edit the Skill

Write the SKILL.md with:

1. YAML frontmatter (name, description, and optional config)
2. Purpose and when to use
3. How Claude should use the skill
4. References to bundled resources

**Writing Style:** Use imperative/infinitive form (verb-first instructions), not second person.

### Step 5: Test and Iterate

After creating the skill:
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Update SKILL.md or bundled resources
4. Test again

**Refinement filter:** Only add what solves observed problems.
