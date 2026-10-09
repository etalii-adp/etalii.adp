# Many agents, one repository

Coding agents are now run several at a time on one codebase: a person starts one agent on a feature, another on a bug and a third on a refactoring, or a lead agent splits a task among workers. The work multiplies, and so does the old problem of software teams, coordination. This analysis reviews what the published record says about that problem as of October 2026: the theory of coordination the problem inherits, the measured ways multi-agent systems fail, and the mechanisms products and practitioners use to keep parallel agents apart and bring their work back together, from git worktrees and containers to specifications, instruction files, task claims, merge queues and review. It ends with what the record implies for a diagram of agent activity.

## Contents

1. Coordination as managing dependencies
2. How multi-agent systems fail
3. Isolating the files: branches and worktrees
4. Isolating the runtime: environments and sandboxes
5. Claiming work: locks, task lists and dependency graphs
6. Specifications as the shared intent
7. Instruction files as shared context
8. Integration: textual and semantic conflicts
9. Review and authority: the human bottleneck
10. Orchestration surfaces
11. The analysis in eight propositions
12. What a diagram of agent activity must show

_Part 1_

## Coordination as managing dependencies

The problem is older than language models. Organisational science and empirical software engineering described it decades ago, and their vocabulary fits parallel agents with almost no adjustment.

- **Coordination is the management of dependencies.** Malone and Crowston define coordination as "the process of managing dependencies among activities" and classify the dependencies: shared resources, producer and consumer relations, simultaneity constraints, and task and subtask relations. Each kind has its own family of coordination mechanisms, such as first-come-first-served allocation for a shared resource or notification for a producer and its consumer.

  [Malone & Crowston 1994](https://crowston.syr.edu/sites/default/files/acmcs94.pdf)

- **Communication cost grows faster than the team.** Brooks observed that adding people to a late software project makes it later, because newcomers need ramp-up, tasks are only partly divisible, and the number of communication channels grows as n(n−1)/2 with n people.

  [Brooks 1975](https://en.wikipedia.org/wiki/Brooks%27s_law)

- **Distance slows work through the number of people involved.** In a study of globally distributed development, Herbsleb and Mockus found that distributed work items took about two and a half times as long as colocated ones, and that the delay was explained by distributed items involving more people rather than by distance itself.

  [Herbsleb & Mockus 2003](https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/herbsleb03.pdf)

- **The structure of the work mirrors the structure of communication.** Conway's observation that organisations "are constrained to produce designs which are copies of the communication structures of these organizations" applies to an agent system as to a team: the way agents are allowed to talk shapes how the code they produce is divided.

  [Conway 1968](https://www.melconway.com/Home/Committees_Paper.html)

> **ADP angle.** Malone and Crowston's dependency types name exactly what a picture of agent activity has to show: which agents share a resource (a file, a branch, a port), which agent consumes what another produces (a specification, a merged change), and which tasks are parts of which. A diagram that shows agents without their dependencies shows the headcount, not the coordination.

_Part 2_

## How multi-agent systems fail

Since 2025 the failures of multi-agent language-model systems have been studied directly, with taxonomies built from annotated traces and benchmarks built for pairs of coding agents. The findings agree that the losses come mostly from how agents are organised rather than from the models alone.

- **A taxonomy of failure.** Cemri and colleagues annotated about 1,600 traces from seven multi-agent frameworks, among them MetaGPT and ChatDev, and arrived at fourteen failure modes in three categories: specification and system design, inter-agent misalignment, and task verification. The misalignment category includes conversation resets, failure to ask for clarification, task derailment, withholding information, ignoring another agent's input, and a mismatch between an agent's reasoning and its actions. The authors conclude that failures stem from "system design issues and inter-agent misalignment, rather than solely from underlying LLM limitations".

  [Cemri et al. 2025](https://arxiv.org/abs/2503.13657) · [MAST repository](https://github.com/multi-agent-systems-failure-taxonomy/MAST)

- **The curse of coordination in coding.** CooperBench gives two coding agents separate features in the same library that can conflict with each other, across more than 600 tasks in twelve libraries and four languages. The authors report that agents achieve on average 30% lower success when working together than when one agent performs both tasks, and name three failure modes: communication channels jammed with vague, ill-timed and inaccurate messages; agents deviating from their own commitments; and agents holding incorrect expectations about the other's plan.

  [CooperBench 2026](https://arxiv.org/abs/2601.13295)

- **When more agents help and when they hurt.** A study of 180 agent configurations by Google Research and MIT reports that centralised coordination improved strongly parallelisable tasks, while on a sequential planning task every multi-agent variant performed worse than a single agent, by 39 to 70%. Independent agents without a coordinator amplified errors far more than centrally coordinated ones, and returns diminished once a single agent was already moderately successful.

  [Google Research 2025](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) · [Kim et al. 2025](https://arxiv.org/abs/2512.08296)

- **Breadth-first work suits many agents; coding less so.** Anthropic's account of its multi-agent research system reports a 90.2% improvement over a single agent on its internal research evaluation, at roughly fifteen times the token use of a chat. It also reports the coordination failures it met: dozens of subagents spawned for simple queries, subagents duplicating one another's searches after vague delegation, and a synchronous design in which the lead could not steer its workers. It states that coding has "fewer truly parallelizable tasks" than research and that agents are "not yet great at coordinating and delegating to other agents in real time".

  [Anthropic 2025a](https://www.anthropic.com/engineering/multi-agent-research-system)

- **The argument for one thread of context.** Cognition argued in 2025 against building multi-agent systems at all, on the grounds that parallel subagents each make implicit decisions, about style or edge cases, that conflict when their results are combined, and that agents should share full traces rather than summaries. In April 2026 the same author published a follow-up that keeps the objection for swarms of parallel writers but reports a narrower class of patterns that work: several agents contribute intelligence to a task while the writes stay single-threaded.

  [Yan 2025](https://cognition.ai/blog/dont-build-multi-agents) · [Yan 2026](https://cognition.ai/blog/multi-agents-working)

- **Start with the simplest arrangement.** Anthropic's guide to agent patterns describes the orchestrator-workers pattern, in which a central model splits a task such as a multi-file code change and synthesises the workers' results, and advises finding "the simplest solution possible, and only increasing complexity when needed".

  [Schluntz & Zhang 2024](https://www.anthropic.com/engineering/building-effective-agents)

- **Structured artifacts instead of conversation.** The early multi-agent software frameworks already diagnosed the problem as one of communication. MetaGPT attributes "logic inconsistencies" to "cascading hallucinations caused by naively chaining LLMs" and replaces free dialogue with standard operating procedures, defined roles and structured intermediate documents published to a shared message pool. ChatDev splits work into a chain of small subtasks and lets an agent ask for specifics before answering, which its authors call communicative dehallucination.

  [Hong et al. 2024](https://arxiv.org/abs/2308.00352) · [Qian et al. 2024](https://arxiv.org/abs/2307.07924)

> **ADP angle.** The literature's failure modes are relations between agents, not properties of one agent: a reset, an ignored input, a withheld fact, a broken commitment. They can only be seen where agents, the messages between them and the commitments they made are shown together.

_Part 3_

## Isolating the files: branches and worktrees

The first problem parallel coding agents meet is mechanical: two agents writing in one working copy overwrite each other. The answer the products have converged on is to give each agent its own working copy, almost always a git worktree on a branch of its own.

- **Worktrees as the default isolation.** Claude Code creates a worktree per named session under `.claude/worktrees/` on a branch of its own, and lets subagents declare worktree isolation. Its documentation states the deciding question plainly: if tasks touch the same files, isolate them in worktrees. Background sessions move into their own worktree before editing, "so parallel sessions can read the same checkout but each writes to its own". Cursor 2.0 runs up to eight agents in parallel on one prompt, each in its own worktree or on a remote machine. OpenAI's Codex and GitHub's Copilot coding agent go further and run each task in a cloud sandbox that ends in a branch and a pull request.

  [Claude Code: worktrees](https://code.claude.com/docs/en/worktrees) · [Claude Code: agent view](https://code.claude.com/docs/en/agent-view) · [Cursor 2.0](https://cursor.com/en-US/changelog/2-0) · [OpenAI 2025](https://openai.com/index/introducing-codex/) · [GitHub 2025](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

- **A category of worktree-based agent managers.** Around the same idea a category of tools appeared that start, track and clean up one agent per worktree: terminal multiplexers that pair a tmux session with a worktree per agent, desktop applications that present each worktree as a workspace, and boards on which each card is a workspace with a branch, a terminal and a development server. The category is volatile: of the open-source examples examined, one was deprecated in February 2026 in favour of a successor and another announced it was being discontinued.

  [claude-squad](https://github.com/smtg-ai/claude-squad) · [uzi](https://github.com/devflowinc/uzi) · [Sculptor](https://github.com/imbue-ai/sculptor) · [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) · [Crystal](https://github.com/stravu/crystal) · [Conductor](https://www.conductor.build/docs)

- **Isolation is partial.** A worktree separates files, not everything. Worktrees of one repository share a single object database and set of references, and git refuses to check out a branch in a second worktree while another holds it. Claude Code's documentation notes that a worktree still shares settings and approvals with the main checkout, and that its guard against writing into the main checkout does not see what a shell command writes. Its experimental agent teams do not isolate teammates in worktrees at all, so "two teammates editing the same file leads to overwrites" and the work must be partitioned by file instead.

  [git-worktree](https://git-scm.com/docs/git-worktree) · [Claude Code: worktrees](https://code.claude.com/docs/en/worktrees) · [Claude Code: agent teams](https://code.claude.com/docs/en/agent-teams)

- **Worktrees accumulate.** Every isolated session leaves a directory and a branch behind. The tools respond with cleanup: Claude Code sweeps stale worktrees and locks the ones in use, and the worktree boards provide orphan cleanup that can be switched off. Cleanup is a coordination concern because removing a worktree another session still works in destroys its work.

  [Claude Code: worktrees](https://code.claude.com/docs/en/worktrees) · [Vibe Kanban](https://github.com/BloopAI/vibe-kanban)

> **ADP angle.** A worktree is a location with an owner, a branch and a lifetime. A diagram that places each agent in its location, and each location on its branch, shows at once which agents can collide and which locations are left over.

_Part 4_

## Isolating the runtime: environments and sandboxes

Separate files do not make separate running systems. Practitioner guides repeat that worktrees "isolate code, not runtime environments", and the products differ mainly in how much of the runtime they isolate as well.

- **Ports, databases and caches still collide.** Two development servers started from two worktrees contend for the same port, and worktrees share the local database, container daemon and caches, so agents running tests can race on shared state. Tools answer with allocation: one gives each agent a port from a configured range, another exposes a per-workspace port variable, and one adds a mode that runs a single workspace from the repository root for projects tied to "a fixed port, local database, or expensive build cache".

  [uzi](https://github.com/devflowinc/uzi) · [Conductor](https://www.conductor.build/docs) · [Upsun 2025](https://developer.upsun.com/posts/ai/git-worktrees-for-parallel-ai-coding-agents)

- **Every worktree must be set up again.** A worktree is a fresh checkout without installed dependencies or ignored files such as local secrets. Claude Code copies listed ignored files into new worktrees; other tools run a setup command per workspace. The cost is repeated installation time and disk space for each agent.

  [Claude Code: worktrees](https://code.claude.com/docs/en/worktrees) · [uzi](https://github.com/devflowinc/uzi) · [Sculptor](https://github.com/imbue-ai/sculptor)

- **Containers per agent.** One step further, an agent gets a container of its own as well as a branch. One open-source server gives "each agent a fresh container in its own git branch", records the full command history so a reviewer sees "what agents actually did, not just what they claim", and lets failures be discarded. Anthropic's account of sixteen agents building a C compiler gave each agent a container with the shared repository mounted as an upstream, from which the agent cloned, worked and pushed back.

  [container-use](https://github.com/dagger/container-use) · [Carlini 2026](https://www.anthropic.com/engineering/building-c-compiler)

- **Hosted sandboxes per task.** The cloud agents run each task in a disposable environment: Codex in a cloud sandbox preloaded with the repository, Copilot's coding agent in an environment powered by GitHub Actions and customised through a workflow file, Google's Jules in a cloud virtual machine. Isolation is then complete, but the environment must be declared, and what the agent may reach from it is a setting rather than a given.

  [OpenAI 2025](https://openai.com/index/introducing-codex/) · [GitHub Docs: Copilot coding agent](https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent) · [The Decoder 2025](https://the-decoder.com/google-launches-coding-agent-jules/)

> **ADP angle.** Location and environment are separate things. A branch says which code an agent sees; an environment says which ports, data and services its code runs against. Both can be shared or private, and a collision in either is a coordination failure.

_Part 5_

## Claiming work: locks, task lists and dependency graphs

Isolation stops agents overwriting each other but not doing the same work twice. The second family of mechanisms makes work claimable, so that a task taken by one agent is visibly taken.

- **A lock is a file in the repository.** In the C compiler project, an agent took a task by writing a file to a `current_tasks/` folder and pushing it; if two agents claimed the same task, git's synchronisation forced the second to choose another. The same account shows what claiming cannot fix: when the work was one large failing build, every agent hit the same bug, fixed it and overwrote the others' fixes, until a known-good compiler was used as an oracle to give each agent a different failure to work on.

  [Carlini 2026](https://www.anthropic.com/engineering/building-c-compiler)

- **A shared task list with claiming.** Claude Code's agent teams keep a task list with dependencies and use file locking so that two teammates cannot claim one task. The documented limitations are coordination failures in their own right: task status can lag when a teammate forgets to mark a task complete, blocking dependent tasks; the lead may stop before all tasks are done or start implementing instead of waiting. The documentation recommends three to five teammates and states that more teammates mean more communication and more potential conflicts.

  [Claude Code: agent teams](https://code.claude.com/docs/en/agent-teams)

- **An issue tracker built for agents.** Beads is a dependency-aware issue tracker in which agents record work as a graph: a command lists the work that has no open blockers, an atomic claim prevents two agents taking one item, and hash-based identifiers avoid collisions when agents create items on different branches.

  [Beads](https://github.com/steveyegge/beads)

- **Delegation must say what is not yours.** Anthropic's research system found that a subagent needs an objective, an output format, guidance on tools and explicit boundaries; without them "agents duplicate work, leave gaps, or fail to find necessary information". Rejection studies of agent pull requests list duplicate pull requests among the reasons agent work is turned down.

  [Anthropic 2025a](https://www.anthropic.com/engineering/multi-agent-research-system) · [Where do AI coding agents fail? 2026](https://arxiv.org/abs/2601.15195)

> **ADP angle.** A claim is a relation between an agent and a task with a moment it started. Showing claims, and the tasks that wait on unclaimed or stalled ones, makes duplicated and blocked work visible before it costs a merge.

_Part 6_

## Specifications as the shared intent

Where isolation separates agents, specifications are meant to keep them aligned: a written statement of what is wanted, read by every agent that works on it, so that intent survives a fresh context window and a handoff between agents. Since 2025 a family of spec-driven development toolkits has made this the organising idea.

- **Specify, plan, split, implement.** GitHub's Spec Kit defines spec-driven development as deciding "what and why before deciding how", with a project constitution and, per feature, a sequence of specify, plan, tasks and implement steps, now followed by a converge step that checks the code against the specification and adds the work still missing. Its philosophy document states the intended inversion: "Specifications don't serve code—code serves specifications." GitHub's announcement presents the toolkit as an experiment in how well the method works.

  [Spec Kit](https://github.com/github/spec-kit) · [Spec Kit: spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md) · [Delimarsky 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

- **Three documents and a constrained requirement form.** AWS's Kiro turns a prompt into a requirements document of user stories with acceptance criteria in the EARS notation ("WHEN … THE SYSTEM SHALL …"), a design document and a task list. OpenSpec, which describes itself as lighter and aimed at existing code, gives each change a folder with a proposal, specifications, a design and tasks, and folds the change's requirements into the main specifications when the change is archived. An MCP server for spec workflows adds a dashboard, an approval step with revisions and searchable implementation logs.

  [Kiro 2025](https://kiro.dev/blog/introducing-kiro/) · [Kiro: specs](https://kiro.dev/docs/specs/concepts/) · [OpenSpec](https://github.com/Fission-AI/OpenSpec) · [Spec Workflow MCP](https://github.com/Pimzino/spec-workflow-mcp)

- **Roles that hand documents to each other.** The BMAD method arranges agents as an agile team, from analyst and product manager to architect, scrum master, developer and tester, in which the scrum master turns plans into story files holding everything the developer agent needs; its README describes the aim as making "the important decisions explicit" and preserving them "as context for the work that follows". This is the same move MetaGPT made in research: roles exchange structured documents rather than conversation. Task decomposition tools in the same family generate a dependency-ordered task list from a product requirements document.

  [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) · [Hong et al. 2024](https://arxiv.org/abs/2308.00352) · [Taskmaster](https://github.com/eyaltoledano/claude-task-master)

- **Handoff artifacts for long-running work.** Anthropic's guidance for agents that work across many context windows uses an initialising agent to write a feature list in which every item starts as failing, and allows later agents to change only whether an item passes. A progress file and the git history carry the state between sessions. The failure modes it addresses are coordination failures over time: an agent trying to do everything at once, a later agent declaring the work finished early, and features marked done without being tested end to end.

  [Young 2025](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

- **Spec-first, spec-anchored, spec-as-source.** Böckeler distinguishes three levels of ambition: a specification written before the code, a specification kept and maintained alongside it, and a specification that is the only artifact people edit. She observes that the tools are all spec-first but not all aim further, and that long-term maintenance of the specification is often left vague. Thoughtworks placed the technique in "Assess" on its Technology Radar in November 2025, warning of elaborate, opinionated workflows and lengthy specification files that are hard to review.

  [Böckeler 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) · [Thoughtworks 2025](https://www.thoughtworks.com/radar/techniques/spec-driven-development)

- **The criticism: waterfall in markdown.** Critics argue that the method revives heavy up-front documentation; one reports that a small feature produced eight files and about 1,300 lines of specification. A 2026 preprint names the opposite risk, silent drift: the code is updated, the specification is deferred indefinitely, and agents that generate code from a stale specification compound the error.

  [Zaninotto 2025](https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back) · [Spec Growth Engine 2026](https://arxiv.org/abs/2606.27045)

> **ADP angle.** A specification is the one artifact that several agents, and the people directing them, all read. Its state, from drafted and approved to split into tasks, implemented and converged, is the backbone against which every agent's activity can be placed; its drift from the code is a state worth showing too.

_Part 7_

## Instruction files as shared context

Beside per-feature specifications, every agent reads standing instructions: project files with conventions, commands and rules that load into each session. They coordinate agents the way a team's working agreements coordinate people, and the evidence on them is mixed.

- **A common format.** AGENTS.md, "a README for agents", was released in August 2025 and contributed in December 2025 to the Agentic AI Foundation under the Linux Foundation, together with MCP. OpenAI reported adoption by more than 60,000 projects and agent frameworks. Tool-specific forms continue beside it, such as Claude Code's CLAUDE.md, which can also read AGENTS.md, and Cursor's rules files scoped by path.

  [AGENTS.md](https://github.com/openai/agents.md) · [Linux Foundation 2025](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) · [Cursor: rules](https://cursor.com/docs/rules)

- **Context, not enforcement.** Claude Code's documentation states that CLAUDE.md is loaded as context, "not enforced configuration", recommends keeping each file under 200 lines because longer files reduce adherence, and warns that where two instructions contradict each other the model may pick one arbitrarily. What must hold regardless belongs in hooks and managed settings.

  [Claude Code: memory](https://code.claude.com/docs/en/memory)

- **Context is a budget.** Anthropic's guidance on context engineering treats the context window as a finite attention budget whose recall degrades as it fills, and recommends the smallest set of high-signal tokens, structured notes outside the window, and subagents that return condensed summaries.

  [Anthropic 2025b](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

- **Measured effects.** Empirical studies of these files find them dominated by build commands, implementation details and architecture, often long and hard to read, and rarely specifying security or performance. An evaluation published in 2026 found that repository context files tended to lower task success compared with none and raised inference cost by more than 20%, because agents follow the instructions, including unnecessary ones; another study of 124 pull requests associated AGENTS.md with shorter runtimes and fewer output tokens at comparable completion.

  [Chatlatanagulchai et al. 2025](https://arxiv.org/abs/2509.14744) · [Agent READMEs 2025](https://arxiv.org/abs/2511.12884) · [Gloaguen et al. 2026](https://arxiv.org/abs/2602.11988) · [AGENTS.md efficiency 2026](https://arxiv.org/abs/2601.20404)

> **ADP angle.** Instruction files are a shared resource in Malone and Crowston's sense: every agent consumes them and any agent may change them. Which instructions an agent was running under is part of explaining what it did.

_Part 8_

## Integration: textual and semantic conflicts

Isolation postpones conflict; it does not remove it. The work of parallel agents returns to one branch through merges, and that is where the cost of independence is paid.

- **Overlap is common.** A 2026 study of 33,596 agent-authored pull requests in 2,807 repositories reports that 40.2% of the repositories had agent pull requests open at the same time, and replays the three-way merges to measure textual conflict rates between them; its reported rate is markedly higher between pull requests of different agents than between pull requests of the same agent.

  [Xu et al. 2026](https://arxiv.org/abs/2607.04697)

- **Conflicts are frequent even when agents cooperate.** In the C compiler project, with sixteen agents pushing to one upstream, "merge conflicts are frequent", and the agents resolved them themselves. The same account reports regressions: new features frequently broke existing ones until the test suite was strengthened.

  [Carlini 2026](https://www.anthropic.com/engineering/building-c-compiler)

- **Semantic conflicts merge cleanly and still break.** A semantic conflict is a pair of changes that integrate textually but interfere in behaviour, such as one agent renaming a function while another adds calls to the old name. Recent work on multi-agent coding observes that the common architecture, a worktree per agent and a merge afterwards, leaves such conflicts to tests, and that tooling does not resolve them. One alternative coordinates agents through shared, observable state using conflict-free replicated data types instead of branches; it reports convergence without merge failures, but still a share of semantic conflicts and speed-ups on some tasks against slow-downs on others.

  [Semantic conflicts with unit tests 2023](https://arxiv.org/abs/2310.02395) · [CAID 2026](https://arxiv.org/abs/2603.21489) · [CodeCRDT 2025](https://arxiv.org/abs/2510.18893)

- **Test the combination before it lands.** Merge queues answer integration at the level of the repository: each pull request is tested together with the base branch and the pull requests ahead of it in the queue, and is removed if the combination fails or conflicts. Stacked pull requests split dependent changes into an ordered series. One agent orchestrator gives the merge queue to an agent role of its own.

  [GitHub Docs: merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) · [Graphite](https://graphite.com/features/merge-queue) · [heise 2026](https://www.heise.de/en/background/Full-Control-Gas-Town-Orchestrates-Ten-or-More-Coding-Agents-11178824.html)

> **ADP angle.** The moment a branch meets its base is the moment the coordination succeeded or did not. Showing which branches are ahead of the base, behind it, in conflict with it or queued for it turns integration from a surprise into a state.

_Part 9_

## Review and authority: the human bottleneck

The products agree on one boundary: agents propose, people integrate. That boundary makes human review the place where parallel work queues up.

- **Agents may push, not merge.** Copilot's coding agent can push only to branches whose names begin with `copilot/`, cannot approve or merge a pull request, and needs a person with write access to approve before workflows run on its pull requests. Claude Code's background sessions open draft pull requests and never push to the main branch, force-push or merge. Codex's announcement asks users to review and validate agent code before integrating it.

  [GitHub Docs: Copilot coding agent](https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent) · [Claude Code: agent view](https://code.claude.com/docs/en/agent-view) · [OpenAI 2025](https://openai.com/index/introducing-codex/)

- **Review is the limit on parallelism.** Practitioners running several agents at once report that the bottleneck is how fast results can be reviewed, and that only one significant change can be reviewed and landed at a time. Tool authors frame the engineer's job as spending most of the time "planning and reviewing coding agents".

  [Willison 2025](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/) · [Orosz 2025](https://blog.pragmaticengineer.com/new-trend-programming-by-kicking-off-parallel-ai-agents/) · [Vibe Kanban](https://github.com/BloopAI/vibe-kanban)

- **Agent pull requests are accepted less often.** The AIDev dataset of 456,535 agent-authored pull requests across 61,453 repositories finds that agent pull requests are accepted less frequently than human ones, which the authors call a trust and utility gap. Studies of rejected agent pull requests find unmerged ones larger and more often failing CI, list duplicate pull requests and misalignment among the causes, and report that most rejected agent pull requests received no explicit reviewer feedback at all.

  [Li et al. 2025](https://arxiv.org/abs/2507.15003) · [Where do AI coding agents fail? 2026](https://arxiv.org/abs/2601.15195) · [Nakashima et al. 2026](https://arxiv.org/abs/2602.04226)

- **Perceived and measured speed differ.** In METR's randomised trial with experienced open-source developers in repositories they knew well, tasks took 19% longer with early-2025 AI tools, while the developers believed they had been sped up by about 20%.

  [METR 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

> **ADP angle.** Review is a queue with a single server, the person. What waits on that person, for how long, and which agents are idle because of it is the measure of whether running more agents helps.

_Part 10_

## Orchestration surfaces

As the number of agents grows, the coordination itself moves into a tool: a place to dispatch work, see its state and step in. Several shapes have appeared since late 2025.

- **A control plane across vendors.** GitHub announced Agent HQ in October 2025, with a mission-control view to assign, steer and track agents from several vendors under the repository's branch permissions and audit log.

  [GitHub 2025b](https://github.blog/news-insights/company-news/welcome-home-agents/)

- **An orchestrator with supervisory roles.** Gas Town, an orchestrator for ten or more coding agents released in January 2026 and described by its coverage as alpha, divides the agents into named roles, among them a mayor that dispatches work, short-lived workers, supervising roles and a refinery that handles the merge queue, and records the work in the dependency-aware tracker of Part 5. A hosted version followed in 2026.

  [heise 2026](https://www.heise.de/en/background/Full-Control-Gas-Town-Orchestrates-Ten-or-More-Coding-Agents-11178824.html) · [The New Stack 2026](https://thenewstack.io/steve-yegges-ai-agent-orchestration-project-gas-town-comes-to-the-cloud-and-brings-the-wasteland-with-it/)

- **Agent views inside the coding tool.** Claude Code compares five ways to run agents in parallel, subagents, an agent view of background sessions, agent teams, workflows and projects, and states that running several at once multiplies token usage. The worktree boards of Part 3 are the same idea built outside the tool: a card or row per agent, its branch, its terminal and its state.

  [Claude Code: parallel agents](https://code.claude.com/docs/en/agents) · [Vibe Kanban](https://github.com/BloopAI/vibe-kanban)

> **ADP angle.** Every orchestration surface found is a list, a board or a terminal grid: one row or card per agent. None draws the relations between agents, specifications, tasks, branches and environments, which is where Parts 1 to 9 locate the failures.

_Part 11_

## The analysis in eight propositions

1. **Coordination is managing dependencies**, and parallel agents inherit every dependency type of human teams: shared resources, producer and consumer, simultaneity, and task and subtask.
2. **Most measured failures are organisational.** Taxonomies and benchmarks attribute multi-agent failure mainly to design and inter-agent misalignment, and coding agents lose about a third of their success when they must cooperate.
3. **Parallelism pays only for divisible work.** Breadth-first and independent tasks gain; sequential, dependency-heavy work such as most coding gains little or loses, and cost grows with every agent.
4. **Isolation is layered and always partial.** A branch, a worktree, a container and a hosted sandbox each isolate more, but files, ports, databases, settings and references can still be shared.
5. **Claims prevent duplicated work; isolation does not.** Duplicates are prevented by visible, atomic claims on tasks with dependencies, and by delegation that states boundaries.
6. **Specifications carry intent across agents and sessions**, but only while they are maintained; their cost is review effort and their risk is silent drift.
7. **Integration is where independence is paid for.** Textual conflicts are frequent and semantic conflicts merge cleanly, so the combination must be tested before it lands.
8. **People remain the integrators**, and review capacity, not agent count, bounds throughput.

_Part 12_

## What a diagram of agent activity must show

The propositions name the things whose relations decide whether parallel agents help: the project, the agents and the conversations they run in, the specifications and the tasks split from them, the locations where agents write (a branch and its worktree), and the environments where their code runs. The record suggests what a diagram of agent activity would have to make visible.

| Concern from the record | What the diagram would show | Parts |
| --- | --- | --- |
| Shared resources | Agents that share a location, a file set or an environment | 1, 3, 4 |
| Duplicated work | Tasks claimed by more than one agent, or by none while others wait | 5 |
| Intent | The specification each task and agent works from, and its state | 6 |
| Standing context | The instruction files an agent runs under | 7 |
| Integration | Each branch against its base: ahead, behind, conflicting, queued, merged | 8 |
| Authority and review | What waits on a person, and since when | 9 |
| Lifetime | Locations and agents left over after their work landed | 3 |

The table is a reading of the sources, not a reported design; no source examined draws these relations as a diagram.

> **ADP angle.** The orchestration tools show agents one by one; the research locates the failures between them. A diagram whose elements are agents, specifications, tasks, locations and environments, and whose relations are claims, reads, writes and merges, would show coordination where the tools today show only activity.

## References

- AGENTS.md. A simple, open format for guiding coding agents. <https://github.com/openai/agents.md>
- Anthropic (2025a). How we built our multi-agent research system. <https://www.anthropic.com/engineering/multi-agent-research-system>
- Anthropic (2025b). Rajasekaran, P., Dixon, E., Ryan, C. & Hadfield, J. Effective context engineering for AI agents. <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- BMAD Method repository. <https://github.com/bmad-code-org/BMAD-METHOD>
- Beads repository. <https://github.com/steveyegge/beads>
- Böckeler, B. (2025). Understanding spec-driven development: Kiro, spec-kit, and Tessl. *martinfowler.com*. <https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html>
- Brooks, F. P. (1975). *The Mythical Man-Month*. Addison-Wesley. Summary: <https://en.wikipedia.org/wiki/Brooks%27s_law>
- CAID (2026). arXiv:2603.21489. <https://arxiv.org/abs/2603.21489>
- Carlini, N. (2026). Building a C compiler with a team of parallel Claudes. <https://www.anthropic.com/engineering/building-c-compiler>
- Cemri, M., Pan, M. Z., Yang, S., Agrawal, L. A., Chopra, B., Tiwari, R., Keutzer, K., Parameswaran, A., Klein, D., Ramchandran, K., Zaharia, M., Gonzalez, J. E. & Stoica, I. (2025). Why do multi-agent LLM systems fail? *NeurIPS 2025*. <https://arxiv.org/abs/2503.13657>
- Chatlatanagulchai, W. et al. (2025). On the use of agentic coding manifests: an empirical study of Claude Code. *PROFES 2025*. <https://arxiv.org/abs/2509.14744>
- Agent READMEs: an empirical study of context files for agentic coding (2025). arXiv:2511.12884. <https://arxiv.org/abs/2511.12884>
- AGENTS.md and agent efficiency (2026). arXiv:2601.20404. <https://arxiv.org/abs/2601.20404>
- Claude Code documentation. Orchestrate teams of Claude Code sessions. <https://code.claude.com/docs/en/agent-teams>
- Claude Code documentation. Agent view. <https://code.claude.com/docs/en/agent-view>
- Claude Code documentation. How Claude remembers your project. <https://code.claude.com/docs/en/memory>
- Claude Code documentation. Run agents in parallel. <https://code.claude.com/docs/en/agents>
- Claude Code documentation. Run parallel sessions with worktrees. <https://code.claude.com/docs/en/worktrees>
- claude-squad repository. <https://github.com/smtg-ai/claude-squad>
- CodeCRDT (2025). arXiv:2510.18893. <https://arxiv.org/abs/2510.18893>
- Conductor documentation. <https://www.conductor.build/docs>
- container-use repository. <https://github.com/dagger/container-use>
- Conway, M. E. (1968). How do committees invent? *Datamation* 14(4), 28–31. <https://www.melconway.com/Home/Committees_Paper.html>
- CooperBench: why coding agents cannot be your teammates yet (2026). *ICLR 2026*. arXiv:2601.13295. <https://arxiv.org/abs/2601.13295>
- Crystal repository. <https://github.com/stravu/crystal>
- Cursor (2025). Changelog 2.0. <https://cursor.com/en-US/changelog/2-0>
- Cursor documentation. Rules. <https://cursor.com/docs/rules>
- Delimarsky, D. (2025). Spec-driven development with AI: get started with a new open source toolkit. *GitHub Blog*. <https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/>
- Detecting semantic conflicts with unit tests (2023). arXiv:2310.02395. <https://arxiv.org/abs/2310.02395>
- git documentation. git-worktree. <https://git-scm.com/docs/git-worktree>
- GitHub (2025). GitHub Copilot: meet the new coding agent. <https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/>
- GitHub (2025b). Introducing Agent HQ: any agent, any way you work. <https://github.blog/news-insights/company-news/welcome-home-agents/>
- GitHub Docs. Managing a merge queue. <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue>
- GitHub Docs. Responsible use of Copilot coding agent. <https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent>
- Gloaguen, T. et al. (2026). Evaluating AGENTS.md: are repository-level context files helpful for coding agents? arXiv:2602.11988. <https://arxiv.org/abs/2602.11988>
- Google Research (2025). Towards a science of scaling agent systems: when and why agent systems work. <https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/>
- Graphite. Merge queue. <https://graphite.com/features/merge-queue>
- heise (2026). Full control: Gas Town orchestrates ten or more coding agents. <https://www.heise.de/en/background/Full-Control-Gas-Town-Orchestrates-Ten-or-More-Coding-Agents-11178824.html>
- Herbsleb, J. D. & Mockus, A. (2003). An empirical study of speed and communication in globally distributed software development. *IEEE Transactions on Software Engineering*. <https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/herbsleb03.pdf>
- Hong, S. et al. (2024). MetaGPT: meta programming for a multi-agent collaborative framework. *ICLR 2024*. <https://arxiv.org/abs/2308.00352>
- Kim, Y., Gu, K., Park, C. et al. (2025). Towards a science of scaling agent systems. arXiv:2512.08296. <https://arxiv.org/abs/2512.08296>
- Kiro (2025). Introducing Kiro. <https://kiro.dev/blog/introducing-kiro/>
- Kiro documentation. Specs. <https://kiro.dev/docs/specs/concepts/>
- Li, H., Zhang, H. & Hassan, A. E. (2025). The rise of AI teammates in software engineering (SE) 3.0. arXiv:2507.15003. <https://arxiv.org/abs/2507.15003>
- Linux Foundation (2025). Linux Foundation announces the formation of the Agentic AI Foundation. <https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation>
- Malone, T. W. & Crowston, K. (1994). The interdisciplinary study of coordination. *ACM Computing Surveys* 26(1), 87–119. <https://crowston.syr.edu/sites/default/files/acmcs94.pdf>
- METR (2025). Measuring the impact of early-2025 AI on experienced open-source developer productivity. <https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/>
- MAST repository. <https://github.com/multi-agent-systems-failure-taxonomy/MAST>
- Nakashima et al. (2026). Why agentic-PRs get rejected. arXiv:2602.04226. <https://arxiv.org/abs/2602.04226>
- OpenAI (2025). Introducing Codex. <https://openai.com/index/introducing-codex/>
- OpenSpec repository. <https://github.com/Fission-AI/OpenSpec>
- Orosz, G. (2025). New trend: programming by kicking off parallel AI agents. *The Pragmatic Engineer*. <https://blog.pragmaticengineer.com/new-trend-programming-by-kicking-off-parallel-ai-agents/>
- Qian, C. et al. (2024). ChatDev: communicative agents for software development. *ACL 2024*. <https://arxiv.org/abs/2307.07924>
- Schluntz, E. & Zhang, B. (2024). Building effective agents. <https://www.anthropic.com/engineering/building-effective-agents>
- Sculptor repository. <https://github.com/imbue-ai/sculptor>
- Spec Growth Engine (2026). arXiv:2606.27045. <https://arxiv.org/abs/2606.27045>
- Spec Kit repository. <https://github.com/github/spec-kit>
- Spec Kit. Spec-driven development. <https://github.com/github/spec-kit/blob/main/spec-driven.md>
- Spec Workflow MCP repository. <https://github.com/Pimzino/spec-workflow-mcp>
- Taskmaster repository. <https://github.com/eyaltoledano/claude-task-master>
- The Decoder (2025). Google launches coding agent Jules. <https://the-decoder.com/google-launches-coding-agent-jules/>
- The New Stack (2026). Steve Yegge's AI agent orchestration project Gas Town comes to the cloud. <https://thenewstack.io/steve-yegges-ai-agent-orchestration-project-gas-town-comes-to-the-cloud-and-brings-the-wasteland-with-it/>
- Thoughtworks (2025). Technology Radar: spec-driven development. <https://www.thoughtworks.com/radar/techniques/spec-driven-development>
- Upsun (2025). Git worktrees for parallel AI coding agents. <https://developer.upsun.com/posts/ai/git-worktrees-for-parallel-ai-coding-agents>
- uzi repository. <https://github.com/devflowinc/uzi>
- Vibe Kanban repository. <https://github.com/BloopAI/vibe-kanban>
- Where do AI coding agents fail? (2026). arXiv:2601.15195. <https://arxiv.org/abs/2601.15195>
- Willison, S. (2025). Embracing the parallel coding agent lifestyle. <https://simonwillison.net/2025/Oct/5/parallel-coding-agents/>
- Xu, Subramanian & Karthik (2026). AI agent pull requests on GitHub: frequency, structure, and merge conflict rates. arXiv:2607.04697. <https://arxiv.org/abs/2607.04697>
- Yan, W. (2025). Don't build multi-agents. *Cognition*. <https://cognition.ai/blog/dont-build-multi-agents>
- Yan, W. (2026). Multi-agents: what's actually working. *Cognition*. <https://cognition.ai/blog/multi-agents-working>
- Young, J. (2025). Effective harnesses for long-running agents. <https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents>
- Zaninotto, F. (2025). Spec-driven development: the waterfall strikes back. *Marmelab*. <https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back>

## Method

Web searches on 9 October 2026 across three strands: isolation and integration of parallel coding agents (product documentation, open-source tools, practitioner accounts and studies of merge conflicts), specifications and instruction files as coordination mechanisms (spec-driven development toolkits, their critiques and empirical studies of context files), and the failure of multi-agent systems together with classic coordination theory. The research environment could open only a few hosts directly: the Claude Code documentation, Anthropic's engineering articles and the GitHub repositories cited were read in full, while the other sources, including every preprint, the GitHub, OpenAI, Cursor and Kiro announcements and documentation, the Thoughtworks Radar, Böckeler's article and the classic papers, were known from search results, abstracts and secondary summaries with matching authors, titles and venues. Figures from those sources are given as their abstracts or summaries state them and should be checked against the originals before reuse; figures that appeared only in secondary write-ups and could not be traced to a source were left out. Product capabilities are as documented on the date of the searches and change quickly. The table in Part 12 is a reading of the sources, not a reported result, and has not been evaluated.
