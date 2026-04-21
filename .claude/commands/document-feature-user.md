You are writing an end-user guide for the ExpenseAI expense tracker. Your writing must be clear, friendly, and free of technical jargon. Write as if explaining to someone who is comfortable using web apps but has no programming knowledge.

Feature to document: **$ARGUMENTS**

---

## Step 1 — Understand the feature

Search the codebase to understand what the "$ARGUMENTS" feature does from a user's perspective:
- Read the relevant component files in `components/`
- Read the relevant page files in `app/`
- Look at what UI elements are rendered, what options exist, and what actions the user can take
- Identify all user-facing states: loading, success, error, empty, disabled
- Note any settings, filters, or format choices available to the user
- Note any prerequisites (must be signed in, must have data, etc.)

Focus on the user experience, not the implementation. You do not need to document types, props, or internal logic.

---

## Step 2 — Write the user guide

Create the file `docs/user/$ARGUMENTS.md` with this exact structure:

```markdown
# How to [Feature Name in plain English]

> **For developers:** see the [technical reference](../../docs/dev/$ARGUMENTS.md)

## What is this?

One or two sentences explaining what this feature does and why it is useful. No technical terms.

## Before you start

List any prerequisites the user must meet before using this feature. Examples:
- "You must be signed in to your account."
- "You need at least one expense recorded."

If there are no prerequisites, write "No setup required — this feature is available immediately."

---

## How to use it

Write one step per distinct user action. Each step must follow this exact format:

### Step N — [Start with an action verb: Click / Enter / Select / Toggle / etc.]

One to three plain-English sentences describing exactly what to do and what happens next.

![Screenshot placeholder: [Describe in detail what should be captured in this screenshot — which UI element is visible, what state it is in, what the user just did]](screenshots/$ARGUMENTS-step-N.png)

---

Include as many steps as the feature actually requires. Do not pad with unnecessary steps.

---

## Options explained

If the feature has any settings, format choices, or filter controls, explain each in a table using plain language. Skip this section if there are no configurable options.

| Option | What it does |
|---|---|
| Option name | Plain English explanation — what changes when this is selected |

---

## Tips

Three to five practical tips that help users get the most out of this feature. Focus on things users might not discover on their own.

- Tip 1
- Tip 2
- Tip 3

---

## Troubleshooting

Cover the most likely problems a user could encounter. Use this format for each:

**Problem:** Describe the symptom exactly as the user would experience it (what they see or what fails).
**Solution:** Step-by-step fix in plain language.

Include at least two, and no more than five, troubleshooting entries.

---

## Frequently asked questions

Write three to five questions a real user might ask after using this feature for the first time.

**Q: Question?**
A: Answer in plain language.
```

---

## Step 3 — Verify and report

1. Confirm `docs/user/$ARGUMENTS.md` exists.
2. Count the screenshot placeholders and list them — each should have a specific, actionable description (not just "screenshot of the UI").
3. Confirm the cross-reference link to `docs/dev/$ARGUMENTS.md` is correct (note: that file may not exist yet — link it anyway).
4. Print a short summary:
   - Sections written
   - Number of steps in the "How to use it" section
   - Number of screenshot placeholders
   - Any user-facing states or options you found in the code but could not clearly describe without more context
