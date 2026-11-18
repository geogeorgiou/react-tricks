# React Tricks

An interactive dashboard of React interview trick questions. Learners predict what a component does, then reveal the answer and watch it run live.

## Language

**Section**:
A named group of related Lessons, such as Effects or Memoization, shown as a heading in the sidebar so a learner can see the shape of the course at a glance. Every Lesson belongs to exactly one Section.
_Avoid_: Category, group, track, chapter

**Lesson**:
A themed group of Questions around one area of React, such as console logging or `useEffect`. One Lesson may touch several related concepts.
_Avoid_: Topic, module, chapter, category

**Question**:
One trick scenario within a Lesson: a single React component paired with what it asks and why it behaves as it does.
_Avoid_: Variant, tab, App, exercise

**Prompt**:
The one-line text of a Question that the learner must answer, such as "What is logged on the first click?".
_Avoid_: Question (for the text itself), title

**Answer**:
The correct result of a Question in production, such as the exact console output, which the learner checks their guess against. StrictMode's extra development behavior is never part of the Answer.
_Avoid_: Solution, result

**Explanation**:
The reasoning behind an Answer: why React behaves that way, ending in a Takeaway.
_Avoid_: Answer (for the reasoning), notes

**Takeaway**:
The one transferable lesson a learner should carry away from a Question.
_Avoid_: Summary, tip, lesson (lowercase)

**Live Preview**:
A Question's component actually running in the page after the learner reveals the Answer.
_Avoid_: Sandbox, demo, playground

**Captured Output**:
The console messages a Live Preview produced, shown to the learner for comparison with the Answer.
_Avoid_: Logs, console entries

**StrictMode-sensitive**:
Describes a Question whose Captured Output differs in development because StrictMode double-invokes renders, effects or updaters.
_Avoid_: Dev-only, flaky
