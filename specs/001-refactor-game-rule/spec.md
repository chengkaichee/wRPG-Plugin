# Feature Specification: Refactor game-rule-dnd5e prompt logic

**Feature Branch**: `001-refactor-game-rule`  
**Created**: Wednesday, September 10, 2025  
**Status**: Draft  
**Input**: User description: "refactor game-rule-dnd5e to move prompt logic from main.tsx into pluginPrompt.ts"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a plugin developer, I want the prompt generation logic for the `game-rule-dnd5e` plugin to be centralized in `pluginPrompt.ts` so that `main.tsx` is cleaner and easier to maintain, and prompt logic is more reusable.

### Acceptance Scenarios
1. **Given** the `game-rule-dnd5e` plugin is loaded, **When** a prompt is generated (e.g., for protagonist creation or narrative guidance), **Then** the prompt logic should be executed from `pluginPrompt.ts` and the correct prompt returned.
2. **Given** the `game-rule-dnd5e` plugin's `main.tsx` file, **When** I review its content, **Then** I should see that all prompt generation logics have been removed and replaced with calls to `pluginPrompt.ts`.
3. **Given** a function in `pluginPrompt.ts` returns a prompt, **When** `main.tsx` receives this prompt, **Then** `main.tsx` can manipulate the prompt variables as needed, and `pluginPrompt.ts` should not have knowledge of these subsequent manipulations.

### Edge Cases
- What happens if `pluginPrompt.ts` is missing or has errors? (This is an implementation detail, but the system should handle errors gracefully).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The `game-rule-dnd5e` plugin MUST centralize all prompt generation logic within `pluginPrompt.ts`, ensuring no actual prompt generation logic remain in `main.tsx`.
- **FR-002**: The `main.tsx` file of the `game-rule-dnd5e` plugin MUST call functions from `pluginPrompt.ts` for all prompt generation.
- **FR-003**: The refactoring MUST not alter the content or behavior of the generated prompts.
- **FR-004**: Functions within `pluginPrompt.ts` MUST return prompt objects only.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---