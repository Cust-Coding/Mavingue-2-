# Git & GitHub Basics

This guide explains Git and GitHub **from zero**.
If you are new, don’t worry. We go step by step.

---

## What is Git?

Git is a tool that **remembers your code changes**.

Think of Git like:
- A **save button** for your project
- A **time machine** for your code

Every time you save with Git, it keeps a history.

---

## What is GitHub?

GitHub is a **website** where you:
- Store your code online
- Share your code with others
- Work together with other developers

Git = tool  
GitHub = place on the internet

---

## Most Important Git Commands (Explained Very Simply)

### 1 `git init`
This starts Git in your project.
Like saying:  
“Hey Git, please watch this folder.”

---

### 2 `git clone <url>`
This copies a project from GitHub to your computer.
Like downloading a project.

---

### 3 `git status`
Shows what is happening right now.

It tells you:
- What files changed
- What files are ready to save

---

### 4 `git add .`
Tells Git which changes you want to save.
Like putting files into a box before saving.

---

### 5 `git add <file>`
Adds only one file.
Use this when you don’t want to add everything.

---

### 6 `git commit -m "message"`
Saves your changes with a message.
Like writing a note:
“I added login feature”

---

### 7 `git log`
Shows all past saves (commits).
Like looking at your project history.

---

### 8 `git branch`
Shows all branches.
Branch = copy of your project.

---

### 9 `git branch <name>`
Creates a new branch.
Like trying new ideas without breaking main code.

---

### 10 `git checkout <branch>`
Moves to another branch.
Like changing rooms.

---

### 11 `git checkout -b <branch>`
Creates a branch AND moves to it.
Shortcut command.

---

### 12 `git pull origin <branch>`
Gets the latest changes from GitHub.
Like saying:
“Give me the newest code.”

---

### 13 `git push origin <branch>`
Sends your code to GitHub.
Like uploading your work.

---

### 14️ `git merge <branch>`
Joins one branch into another.
Like mixing two ideas together.

---

### 15 `git remote -v`
Shows where your GitHub project lives.
Shows the online address.

---

##  What is a Branch? (Super Simple)

A branch is a **safe copy** of your code.

You use branches to:
- Try new features
- Fix bugs
- Avoid breaking the main code

---

## Open Source Contribution (Simple Steps)

Open source means **many people work on the same project**.

### How to help an open source project:

1. Fork the project (make your own copy)
2. Clone it to your computer
3. Create a new branch
4. Make changes
5. Commit your changes
6. Push to GitHub
7. Open a Pull Request

A **Pull Request** means:
“Hey, I fixed something. Please add my work.”
 
 ### Bad message
```bash
    git commit -m "update"
```

---

## What is a Commit Message?

A commit message explains **what you did**.

### Format:
```bash
    git commit -m "type: what you did"
```
### Examples:
"feat: add login page"
"fix: solve crash on startup"
"docs: update readme"
"chore: update dependencies"

---

## Conventional Commits (Very Easy)

Conventional commits use a **rule** to write messages.


---

### Common Types (Easy Meaning)

- `feat` → new thing added
- `fix` → bug fixed
- `docs` → documentation change
- `style` → formatting only
- `refactor` → improve code
- `test` → tests added
- `chore` → boring but needed work
---

## Why This Is Important

- Others understand your code
- Your history looks clean
- Working together is easier
- GitHub projects look professional

---

## Final Words

Everyone starts confused.
That’s normal.

Keep practicing.
Git becomes easy with time.

You got this 
