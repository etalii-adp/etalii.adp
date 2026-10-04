# Behavior that can be read as instructions

Behavior trees were invented to keep the decision logic of game characters modular as it grew, and were later adopted by robotics for the same reason. This analysis reviews where behavior trees came from, the vocabulary they settled on, how they compare with the alternatives game developers and roboticists use, and the published work that already combines them with language models. It then reads that vocabulary against the way the behavior of chat agents is engineered today, says where each term must be adjusted before it fits, and ends in a proposal in which a behavior tree is itself the agent's instruction file, while a diagram visualizes and edits it.

## Contents

1. Where behavior trees came from
2. The node vocabulary
3. Blackboards, ticks and events
4. Behavior trees among the alternatives
5. Behavior trees in robotics
6. How agent behavior is written today
7. Agent workflow patterns
8. Behavior trees already applied to language models
9. Translating the vocabulary to agents
10. A behavior tree as the instruction file
11. The analysis in seven propositions
12. The diagram this calls for

_Part 1_

## Where behavior trees came from

Behavior trees emerged in commercial game development in the mid-2000s as a response to the finite state machines that controlled non-player characters. As characters gained more behaviors, every new state needed transitions to and from many existing ones, and the logic became hard to extend without breaking it.

- **Halo 2 and the GDC 2005 talk.** Damian Isla, AI lead on Halo 2 at Bungie, presented the character AI of that game at the Game Developers Conference in 2005 under the title "Handling Complexity in the Halo 2 AI". The system organised behaviors in a hierarchy in which a parent chose among prioritised children, each child describing for itself when it was relevant, and added mechanisms such as impulses to let urgent reactions pre-empt the prioritised order. The talk is the reference point the literature returns to for the origin of the technique, although the structure it describes is closer to a hierarchical state machine with prioritised selection than to the formalised trees that followed.

  [Isla 2005](http://www.gamasutra.com/view/feature/130663/gdc_2005_proceeding_handling_.php) · [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096)

- **Popularisation through AiGameDev.** Through lectures and articles on AiGameDev.com from around 2007, Alex Champandard turned the idea into a teachable pattern with a small vocabulary of sequences, selectors, decorators, conditions and actions. The Behavior Tree Starter Kit he later published with Philip Dunstan in Game AI Pro builds the technique up incrementally and contrasts first-generation implementations with second-generation ones.

  [Champandard & Dunstan 2013](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter06_The_Behavior_Tree_Starter_Kit.pdf)

- **The practitioner's account.** Chris Simpson's 2014 article "Behavior trees for AI: How they work", written from his experience on Project Zomboid, became one of the most read introductions because it moves from the abstract node types to the concrete nodes a game actually needs, and shows a fully developed tree rather than a toy. It describes a tree as hierarchical nodes that control the flow of decision making, with leaves that issue commands and branches that route the traversal.

  [Simpson 2014](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work)

- **From practice to pitfalls.** Once the technique was common, practitioners began documenting the ways tree designs go wrong in production and how to avoid them, a sign that the vocabulary alone does not make a tree readable.

  [Francis 2017](https://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter09_Overcoming_Pitfalls_in_Behavior_Tree_Design.pdf)

> **ADP angle.** The origin story is about authors, not algorithms: behavior trees won because an author could add a behavior in one place without rewiring the rest. That is the same property a person editing an agent's instructions needs.

_Part 2_

## The node vocabulary

Across implementations, a behavior tree is built from a handful of node types that return one of three statuses. The vocabulary is small enough to memorise, and that smallness is a large part of its appeal.

- **Three statuses and the tick.** Each node, when executed, returns success, failure or running. Running means the node has started but not finished, for instance a character still walking to a door. Execution proceeds by ticking: a signal enters at the root and propagates down to the nodes that are currently relevant, which report their status back up.

  [Simpson 2014](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work) · [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084)

- **Sequence.** A sequence ticks its children from left to right and fails as soon as one child fails; it succeeds only when all children succeed. It expresses "do these things in order", and because a failing condition stops the sequence, a condition placed first acts as a precondition for the actions after it.

  [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084) · [Champandard & Dunstan 2013](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter06_The_Behavior_Tree_Starter_Kit.pdf)

- **Selector or fallback.** A selector ticks its children in order until one succeeds, and fails only when all fail. It expresses priorities and alternatives: try the preferred option, fall back to the next. Robotics literature prefers the name fallback, which describes what it does rather than suggesting a free choice.

  [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084)

- **Parallel.** A parallel node ticks all children together and decides its own status by a policy, for example succeed when all succeed, or when a given number succeed. Game engines differ in how much true concurrency they offer; some restrict parallelism to a main task with a background task.

  [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084) · [Unreal Engine docs, composites](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-composites)

- **Decorators.** A decorator has exactly one child and alters its execution or result. The common ones are the inverter (success becomes failure and the reverse), the succeeder (always succeeds), the repeater (re-runs its child, optionally a fixed number of times), repeat until fail, retry until success, and in game engines a cooldown that blocks a branch for a period after it ran.

  [Simpson 2014](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work) · [Unreal Engine docs, decorators](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators) · [BehaviorTree.CPP docs](https://www.behaviortree.dev/)

- **Conditions and actions.** The leaves are of two kinds. A condition checks something about the world and returns success or failure without changing anything; an action changes the world and may return running while it works. Keeping the two apart is what lets a tree be read as "if this holds, do that".

  [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084) · [Ghzouli et al. 2020](https://doi.org/10.1145/3426425.3426942)

- **Sub-trees.** Any node can be the root of a tree reused elsewhere. Reuse of sub-trees is the modularity argument in its concrete form: a behavior written once, such as "take cover", is referenced from many places.

  [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096) · [Ghzouli et al. 2020](https://doi.org/10.1145/3426425.3426942)

> **ADP angle.** The vocabulary is a closed set of element kinds with fixed arity: composites with many ordered children, decorators with exactly one, leaves with none. A diagram type in DISL can encode exactly that, and a tool can then refuse a decorator with two children rather than leave the author to find out at run time.

_Part 3_

## Blackboards, ticks and events

A tree decides what to do; it does not by itself hold what is known. Two further mechanisms, a shared memory and a policy for when to re-evaluate, distinguish one implementation from another.

- **The blackboard.** Nodes share data through a blackboard, a key-value store attached to the tree or the character. Conditions read it, actions and background services write it. The blackboard keeps nodes independent of each other: a node knows the keys it reads and writes, not which node produced them.

  [Unreal Engine docs, overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview) · [BehaviorTree.CPP docs](https://www.behaviortree.dev/)

- **Ticked trees.** First-generation trees are ticked from the root every frame or at a fixed rate. Each tick re-evaluates the conditions along the way, so a higher-priority branch can take over as soon as its condition becomes true. The cost is wasted work, and the reactivity depends on the tick rate.

  [Champandard & Dunstan 2013](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter06_The_Behavior_Tree_Starter_Kit.pdf) · [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084)

- **Event-driven trees.** The behavior trees of a widely used commercial game engine are event-driven: instead of checking every frame whether something relevant has changed, the tree listens for events, typically changes to blackboard keys, and re-evaluates only then. The documentation names performance and debuggability as the reasons.

  [Unreal Engine docs, overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

- **Decorators with observer aborts.** In that engine, conditions are written as decorators attached to a composite or task, and each carries an observer aborts setting: none, self (abort this branch when the condition stops holding), lower priority (abort branches to the right when it starts holding) or both. This is how an event-driven tree recovers the reactivity a ticked tree gets by re-evaluation: a guard watches its condition and interrupts the running branch.

  [Unreal Engine docs, decorators](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators)

- **Services.** The same engine attaches services to composites and tasks; a service runs at its own interval for as long as its branch is active, typically to make checks and update the blackboard. The documentation presents services as taking the place of the traditional parallel node.

  [Unreal Engine docs, services](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-services)

- **Graph editors in game engines.** Game engines with built-in behavior tree editors present the tree as a top-to-bottom graph with plain-language nodes, blackboard variables, reusable sub-graphs and live highlighting of the running branch during play. The visual form is not decoration: it is the medium in which the people who author game behavior work.

  [Unity Behavior docs](https://docs.unity3d.com/6000.1/Documentation/Manual/com.unity.behavior.html) · [Unreal Engine docs, overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

> **ADP angle.** The blackboard and the guard are the two ideas an agent most obviously already has: its context window is a blackboard, and "stop if the user changes their mind" is an observer abort. The diagram therefore needs to show a guard as wrapping a branch rather than as a step in it.

_Part 4_

## Behavior trees among the alternatives

Behavior trees are one of four architectures game AI commonly uses for decision making, and the literature defines them partly by contrast.

- **Finite state machines.** A state machine lists states and the transitions between them, and each state must know which states may follow. Colledanchise and Ögren compare such transitions to one-way control transfers, the goto of early programming, and behavior trees to function calls that return control to their caller with a status. The comparison explains the modularity claim: a sub-tree can be moved because it does not name its successor.

  [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084) · [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096)

- **Hierarchical state machines and statecharts.** Harel's statecharts extend state machines with hierarchy, concurrency and communication, and hierarchical state machines were the dominant game technique before behavior trees. Analyses of the Halo 2 system often describe it as a hierarchical state machine with prioritised selection, which shows how close the two families are; a comparison of behavior tree languages with state and activity diagrams draws the same conclusion from the language side.

  [Harel 1987](https://doi.org/10.1016/0167-6423(87)90035-9) · [Ghzouli et al. 2020](https://doi.org/10.1145/3426425.3426942)

- **Goal-oriented action planning.** For F.E.A.R., Jeff Orkin reduced the state machine to three states (go to, animate, use a smart object) and let an A* planner chain actions, each with preconditions and effects, toward a goal at run time. Planning produces behavior nobody wrote down explicitly, at the price of behavior that is harder to predict and to author for.

  [Orkin 2006](https://pages.cs.wisc.edu/~dyer/cs540/handouts/gdc2006_orkin_jeff_fear.pdf) · [Orkin 2003](https://static.hlt.bme.hu/semantics/external/pages/C%C3%A9lvez%C3%A9relt_Tev%C3%A9kenys%C3%A9gtervez%C3%A9st(GOAP)/alumni.media.mit.edu/_jorkin/WS404OrkinJ.pdf)

- **Utility AI.** Utility systems score every candidate action by response curves over the current situation and pick the highest score, which suits choices among many comparable options better than a fixed priority order. Dave Mark and Kevin Dill introduced the approach to the GDC AI Summit in 2010, and the later infinite axis utility system made it data-driven.

  [Mark & Dill 2010](https://gdcvault.com/play/1012410/Improving-AI-Decision-Modeling-Through) · [Utility system, encyclopaedia entry](https://en.wikipedia.org/wiki/Utility_system)

- **Hybrids are normal.** In practice the families are combined: a behavior tree whose selector consults utility scores, or a tree whose leaf invokes a planner. The robotics survey gives separate attention to trees synthesised or extended by planning and by learning.

  [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096)

> **ADP angle.** Each alternative has an agent counterpart: state-machine workflows, planners that decompose a goal at run time, and routers that score options. The behavior tree's advantage for an instruction file is specific: it is the only one of the four whose structure reads naturally as an outline of instructions.

_Part 5_

## Behavior trees in robotics

From about 2012 robotics took up behavior trees, gave them a formal footing, and built the open-source infrastructure that is now the most widely used outside games.

- **From games to control systems.** Ögren argued in 2012 that the modularity of unmanned aerial vehicle control could be improved with "computer game behavior trees", showing that behavior trees are a kind of hybrid dynamical system whose transitions are encoded implicitly in the tree rather than in transition tables.

  [Ögren 2012](https://www.csc.kth.se/~petter/Publications/ogren2012bt.pdf)

- **Formal properties.** Colledanchise and Ögren showed that behavior trees generalise sequential behavior compositions, the subsumption architecture and decision trees, and analysed robustness and safety in terms of the tree's structure. Their book "Behavior Trees in Robotics and AI" is the first comprehensive text on the subject and the standard reference for the vocabulary used in this analysis.

  [Colledanchise & Ögren 2017](https://doi.org/10.1109/TRO.2016.2633567) · [Colledanchise & Ögren 2018](https://arxiv.org/abs/1709.00084)

- **The survey view.** A 2022 survey of behavior trees in robotics and AI traces the move from games to robots and catalogues uses in manipulation, mobile robots, aerial vehicles and planning, along with the methods for synthesising trees automatically by planning and learning.

  [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096)

- **BehaviorTree.CPP and its editor.** The C++ library BehaviorTree.CPP loads trees from an XML description at run time, treats asynchronous actions as first-class, offers reactive sequences and fallbacks that re-check earlier conditions while a later child is running, and passes data between nodes through typed ports on a blackboard. A separate graphical editor creates and monitors the trees.

  [BehaviorTree.CPP docs](https://www.behaviortree.dev/) · [BehaviorTree.CPP repository](https://github.com/BehaviorTree/BehaviorTree.CPP)

- **Navigation in ROS 2.** The Nav2 navigation stack for ROS 2 orchestrates navigation with a behavior tree: the navigator reads the tree from an XML file and executes it with BehaviorTree.CPP, so recovery behaviors such as clearing a costmap or backing up are fallbacks that an integrator can rearrange without writing code.

  [Macenski et al. 2020](https://arxiv.org/abs/2003.00368) · [Nav2 behavior tree docs](https://docs.ros.org/en/iron/p/nav2_behavior_tree)

- **How trees are actually written.** A study of open-source robotics applications found behavior trees used as a domain-specific language with a small set of concepts, and compared their semantics to state and activity diagrams; the trees it studied are stored as files in the applications' source repositories.

  [Ghzouli et al. 2020](https://doi.org/10.1145/3426425.3426942)

> **ADP angle.** Robotics has already made the move this analysis proposes for agents: the tree lives in a text file that is the configuration, and the graphical editor is a view on that file. What robotics did not need is for the file to also be readable by the executor as prose.

_Part 6_

## How agent behavior is written today

The behavior of a language-model agent is specified mostly in natural language that the model reads at the start of a session, supplemented by tool definitions and code around the model.

- **System prompts.** The basic medium is a system prompt: prose that sets the role, the rules and the procedure. It is read in full on every turn, has no enforced structure, and is interpreted rather than executed.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Coding agents' instruction files.** Coding agents read Markdown files checked into a repository, such as AGENTS.md or CLAUDE.md, and load them into the system prompt. The common format is described as a README for agents: build steps, test commands, conventions and procedures, in standard Markdown with no required schema. Files can be layered by scope (organisation, user, project, folder) and can import one another.

  [AGENTS.md 2025](https://agents.md/) · [Claude Code docs, memory](https://docs.claude.com/en/docs/claude-code/memory)

- **Skills.** Skills package instructions as a folder whose SKILL.md carries a short description loaded at start-up and a body loaded only when the skill becomes relevant, with further files loaded only as needed. This progressive disclosure is a form of sub-tree loading: the agent knows a behavior exists by its name and expands it on demand.

  [Anthropic 2025](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

- **Procedure as prose.** In all three media, procedures are written as numbered steps, conditionals ("if the tests fail, ...") and standing rules. The procedure is implicit in the prose: nothing distinguishes a step from a condition, an alternative from a fallback, or says where a loop ends.

  [AGENTS.md 2025](https://agents.md/) · [Anthropic 2025](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

> **ADP angle.** The instruction file is already the configuration of an agent, already Markdown and already under version control. What it lacks is a structure a tool can see without stopping the model from reading it as instructions.

_Part 7_

## Agent workflow patterns

Practitioner guidance on agent engineering has converged on a small set of composable patterns. They are described here as published, because Part 9 maps them onto the node vocabulary.

- **Workflows and agents.** Workflows orchestrate models and tools through predefined code paths; agents let the model direct its own process and tool use. Both are built from an augmented model with retrieval, tools and memory, and the recurring advice is to begin with the simplest pattern that works.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Prompt chaining.** A task is decomposed into a fixed sequence of calls, each working on the previous output, with programmatic checks (gates) between steps to verify progress.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Routing.** An input is classified and directed to a specialised follow-up, which separates concerns and allows more specialised prompts.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Parallelisation.** Independent subtasks run at once (sectioning), or the same task runs several times for diverse outputs that are then aggregated (voting).

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Orchestrator-workers.** A central model breaks an unpredictable task into subtasks at run time, delegates them to workers and synthesises the results.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Evaluator-optimizer.** One call generates, another evaluates and gives feedback, in a loop, which pays off when evaluation criteria are clear.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **The agent loop and its controls.** An autonomous agent acts in a loop on feedback from its environment, needs ground truth from the environment at each step (a tool result, a test outcome), may pause for human feedback at checkpoints or when blocked, and needs stopping conditions such as a maximum number of iterations. The loop of interleaved reasoning and acting is the pattern ReAct introduced.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents) · [Yao et al. 2023](https://arxiv.org/abs/2210.03629)

- **State machines for agents.** StateFlow models a model's task-solving process explicitly as a state machine, separating process grounding (states and transitions) from sub-task solving (actions within a state), and reports higher success at lower cost than an unstructured loop on two benchmarks. It is evidence that making the control structure explicit helps, independent of which structure is chosen.

  [Wu et al. 2024](https://arxiv.org/abs/2403.11322)

> **ADP angle.** Every pattern in this list is a control structure with a familiar shape: a sequence with gates, a selector, a parallel, a delegation, a loop with a stopping condition. The patterns are presented as boxes and arrows in the guidance itself, which suggests the vocabulary is waiting for a notation.

_Part 8_

## Behavior trees already applied to language models

Published work combining behavior trees and language models falls into three groups: models that generate trees for robots, trees whose nodes call models, and trees used to structure dialogue.

- **Generating trees for robots.** LLM-BRAIn fine-tuned a 7-billion-parameter model to produce robot behavior trees from text, and in a blind comparison participants could not reliably tell generated trees from human ones. LLM-MARS extended the approach to multi-robot systems with dialogue about the robots' actions. BTGenBot showed that compact fine-tuned models can generate usable trees, validated statically, in simulation and on a real robot, and a successor targets a one-billion-parameter model. LLM-as-BT-Planner compared in-context learning and fine-tuning for generating assembly trees, and other studies propose full pipelines with multi-level verification of the generated trees.

  [Lykov & Tsetserukou 2023](https://arxiv.org/abs/2305.19352) · [Lykov et al. 2023](https://arxiv.org/abs/2312.09348) · [Izzo et al. 2024](https://arxiv.org/abs/2403.12761) · [BTGenBot-2 2026](https://arxiv.org/abs/2602.01870) · [Ao et al. 2025](https://arxiv.org/abs/2409.10444) · [Li et al. 2024](https://arxiv.org/abs/2401.08089) · [Cao & Lee 2023](https://arxiv.org/abs/2302.12927)

- **Language understanding in front of a tree.** Other systems keep the tree hand-written and use a model to translate a user's instruction into activating the right branches or plug-ins, reporting high accuracy from instruction to execution on real robots.

  [Chekam et al. 2025](https://arxiv.org/abs/2508.09621)

- **Trees with model nodes.** Kelley's Dendron library programs language-model agents as behavior trees whose actions and conditions are implemented by language and multimodal models, so that a condition can be a question in natural language. Relying on the formal results for behavior trees, it builds control structures that give safety guarantees about sub-trees driven by a model, demonstrated on a chat agent and on an agent that obeys constraints it was never trained on.

  [Kelley 2024](https://arxiv.org/abs/2404.07439)

- **Trees for dialogue.** Wijekoon, Corsar and Wiratunga used behavior trees for both the dialogue model and the explanation strategies of a conversational chatbot, arguing that sub-trees make dialogue components reusable and interpretable at different granularities, in contrast to state-transition models.

  [Wijekoon et al. 2022](https://arxiv.org/abs/2211.06402)

- **Trees for game agents again.** Language models are also used to generate behavior trees for non-player characters in a domain-specific language, closing the loop back to the games in which the technique began.

  [PORTAL 2025](https://arxiv.org/abs/2503.13356) · [FSE 2025 industry paper](https://conf.researchr.org/details/fse-2025/fse-2025-industry-papers/25/Enhancing-Game-AI-Behaviors-with-Large-Language-Models-and-Agentic-AI)

> **ADP angle.** In all of this work the tree is executed by code and the model either writes the tree or sits inside a node. No published work found treats the tree as text the model itself reads and follows, which is the gap the proposal in Part 10 occupies.

_Part 9_

## Translating the vocabulary to agents

The game vocabulary carries over to agent engineering almost term by term, but each term changes meaning when the interpreter is a language model reading instructions rather than an engine executing nodes. The adjustments below are what the format in Part 10 builds in.

- **Success and failure become judgements.** In a game, an action's status is computed. For an agent, success and failure are judged by the model, and the judgement is only as good as its evidence. The guidance to obtain ground truth from the environment at each step becomes a rule for leaves: a step should say what counts as done (a test runner's exit code, a tool's result) rather than leave the model to declare its own success.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Running and ticking become turn-based.** A game ticks many times a second; a chat agent advances one tool call or one turn at a time, and a node that waits for a person is running across turns, possibly for days. Each turn is the tick, and the conversation so far is where the tree's position is remembered. An event-driven reading fits better than a ticked one: the agent re-evaluates when something arrives, a tool result or a message, not on a clock.

  [Unreal Engine docs, overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

- **The blackboard is the context.** Conversation, memory files and tool results play the blackboard's role. Conditions are therefore questions answered from context, and a condition never acts: if the answer is not in context, the right node is an action that obtains it (read a file, ask the user), not a condition that guesses.

  [Kelley 2024](https://arxiv.org/abs/2404.07439) · [Claude Code docs, memory](https://docs.claude.com/en/docs/claude-code/memory)

- **The workflow patterns are compositions.** Prompt chaining with gates is a sequence of actions interleaved with checks; routing is a fallback whose branches each begin with a check; sectioning is a parallel; the evaluator-optimizer is a loop whose stopping condition is the evaluation; orchestrator-workers is a parallel of delegations. Only voting and run-time decomposition lack a static counterpart, because they decide the shape of the work while doing it.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Asking the user and approval are first-class.** Games have no human in the decision loop; agents do. Asking the user is a leaf that is running until the answer arrives; approval is a gate over an action, and a refusal must be failure so that the surrounding fallback or sequence handles it like any other failure, instead of the agent proceeding anyway.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents)

- **Delegation is a sub-tree.** Handing work to a sub-agent, or to another instruction file, is the sub-tree reference of games and robotics. Skills' progressive disclosure is the agent world's lazy sub-tree: the name is known up front and the contents are read when the branch is entered.

  [Anthropic 2025](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) · [Iovino et al. 2022](https://doi.org/10.1016/j.robot.2022.104096)

- **"Repeat until" is the agentic loop.** The agent loop is a repeater whose stopping condition is stated in words. The stopping condition is the label, because a loop without one is the failure mode practitioners warn about; a maximum number of iterations belongs in the node's notes or in a retry decorator.

  [Schluntz & Zhang 2024](https://www.anthropic.com/research/building-effective-agents) · [Yao et al. 2023](https://arxiv.org/abs/2210.03629)

- **Guards are observer aborts.** A condition that must keep holding while a branch runs ("only while the user has not changed the scope") is the observer abort of event-driven trees: it is re-checked whenever new context arrives, and the branch is abandoned when it fails.

  [Unreal Engine docs, decorators](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators)

- **What is deliberately left out.** The inverter is better written as a negated check in plain words; the succeeder as a note that a failure is acceptable; the cooldown has little meaning without a clock; and the formal guarantees of behavior trees do not hold when a model interprets the tree rather than code executing it. Where guarantees are needed, the tree must be executed by a runtime, as in Dendron; a tree read by the model is a structure that makes instructions clearer and checkable by people, not a proof.

  [Kelley 2024](https://arxiv.org/abs/2404.07439) · [Colledanchise & Ögren 2017](https://doi.org/10.1109/TRO.2016.2633567)

> **ADP angle.** The adjusted vocabulary has eleven node kinds: three composites, four decorators and four leaves. Each is a plain verb phrase a model understands without knowing what a behavior tree is, which is the condition for the tree and the instructions to be one file.

_Part 10_

## A behavior tree as the instruction file

The proposal is a diagram called Agent Behavior Modelling in which the behavior tree is stored in the agent's own instruction file: a Markdown file a chat agent reads, such as a system prompt, an AGENTS.md or CLAUDE.md file, or a skill. The model reads the tree as instructions; the diagram reads the same lines as a tree.

- **Where the tree lives.** The tree is the first bullet list under the first heading called "Behavior". Each list item is one node, written `- **<Keyword>:** <label>`. Items indented under an item are its children, in order. Plain lines indented under an item are notes: extra instructions for that node. The rest of the file is ordinary prose and is preserved as written.

- **Composites.** "Do in order" is the sequence: run the children in turn and fail at the first failure. "Try in order" is the fallback or selector: try the children in turn and succeed at the first success. "Do together" is the parallel: independent children that may run at once, such as parallel tool calls or sub-agents; it succeeds when all succeed.

- **Decorators.** Each has exactly one child. "Retry up to N times" is the retry decorator. "Repeat until" is the loop, whose label is the stopping condition: the agentic loop. "Only while" is the guard, whose label is the condition; the child is abandoned when the condition stops holding. "Ask approval before" is the human approval gate; a refusal means failure.

- **Leaves.** "Check" is a condition answered from the conversation, memory or a tool result, and never acts. "Do" is an action: a tool call, an answer, an edit. "Ask the user" asks for human input and waits for the answer. "Delegate" hands the work to a sub-agent or to another behavior file linked from the label.

- **The visualization stays outside.** A separate `.adp` registration file holds the visualization, the positions the author dragged nodes to, and never the logic. Deleting it loses only a layout; the behavior is unchanged.

- **An example.** A pull request reviewer reads as follows. The first branch of the fallback is a routing gate (a check followed by an action); the second is a prompt chain with a parallel step, a retried step whose note states the ground truth, and an approval gate before the one action with an external effect.

```markdown
# Pull request reviewer

You review pull requests in this repository.

## Behavior

- **Try in order:** Review the pull request
  - **Do in order:** Skip what needs no review
    - **Check:** The pull request only changes generated files
    - **Do:** Say that it needs no review
  - **Do in order:** Review the change
    - **Do together:** Gather context
      - **Do:** Read the diff
      - **Do:** Read the linked issue
    - **Retry up to 2 times:** Run the tests
      - **Do:** Run the test suite
        Report the runner's exit code, not a summary of its output.
    - **Ask approval before:** Post the review
      - **Do:** Post the review comments
```

- **Why this shape.** It is readable as instructions by a model with no knowledge of behavior trees: the keywords are plain verbs and the nesting is ordinary Markdown. It is parseable and editable line by line, so a diagram can splice an edit into the file without rewriting the author's prose around it. And it keeps the diagram's layout out of the instructions, so the agent never reads coordinates.

> **ADP angle.** The format follows the same division as FBL's byte-preserving splices: the file belongs to its author and to the agent that reads it, and the diagram edits only the lines that are the tree. This is the robotics arrangement (text file as configuration, graphical editor as a view) with one addition: the configuration is also the prose the executor reads.

_Across the parts_

## The analysis in seven propositions

Read together, the game, robotics and agent literatures support the following propositions for anyone engineering an agent's behavior:

1. **Behavior is a control structure.** Agent procedures already consist of sequences, alternatives, parallels, loops and gates; writing them as such makes the structure visible instead of implicit in prose.
2. **Modularity is the reason to use a tree.** As in games, the value lies in adding or moving a behavior in one place without rewiring the rest, which a tree permits because no node names its successor.
3. **Success needs evidence.** Statuses that a game computes, an agent judges; every leaf that can fail should say what ground truth decides it.
4. **The turn is the tick.** Agents are event-driven by nature: they re-evaluate when a tool result or a message arrives, and guards are checked then.
5. **People are nodes.** Asking the user and approving an action belong in the tree with defined outcomes, a refusal being a failure the tree handles.
6. **One file, two readers.** The instruction file should be read as instructions by the model and as a tree by a tool, with layout kept elsewhere so neither reader is distracted by the other's needs.
7. **Structure is not proof.** A tree the model interprets clarifies and constrains, but guarantees require a runtime that executes the tree; the two uses should not be confused.

_From analysis to tool_

## The diagram this calls for

Agent Behavior Modelling is a diagram: elements and the relations between them, laid out on a canvas, with the instruction file as its document. A tool engineer specifies it with the elements and relations below; the shapes follow game engines' editors, which set composites and decorators apart by outline.

| Element | Kind of node | Children | Label means | Shown as |
|---|---|---|---|---|
| Do in order | Composite (sequence) | Many, ordered | The goal of the steps | Squircle; children left to right |
| Try in order | Composite (fallback) | Many, ordered | What is being attempted | Squircle; children in priority order |
| Do together | Composite (parallel) | Many | What the parallel work achieves | Squircle |
| Retry up to N times | Decorator (retry) | Exactly one | The step being retried; N in the keyword | Hexagon above its child |
| Repeat until | Decorator (loop) | Exactly one | The stopping condition | Hexagon above its child |
| Only while | Decorator (guard) | Exactly one | The condition that must keep holding | Hexagon above the branch it guards |
| Ask approval before | Decorator (approval gate) | Exactly one | The action needing approval | Hexagon above its child |
| Check | Leaf (condition) | None | The question answered from context | Pill, in its own colour |
| Do | Leaf (action) | None | The action | Box |
| Ask the user | Leaf (human input) | None | The question to the user | Parallelogram, the flowchart shape for input |
| Delegate | Leaf (sub-tree) | None | The sub-agent or linked behavior file | Diode, pointing onward |

Every node shows its keyword above its label, so the kind can be read without a legend, and the tree is laid out top-down from the file; a position the author drags a node to is kept in the `.adp` registration.

The relation is a single one, parent to child, ordered; notes attach to a node as its text. The diagram's editing operations follow from the format: adding, moving, re-parenting and relabelling a node rewrite only the list items concerned, and the rest of the file, prose and notes alike, is spliced through unchanged. Validation follows from the arity column: a decorator with no child or two children, an unknown keyword, or a "Retry up to N times" without a number is reported against the line it occurs on.

> **ADP angle.** Two properties distinguish this diagram from the others in this series. Its document is owned by another reader, the agent, so the diagram must never write anything the agent would misread, which is why positions live in the `.adp` registration. And its elements are verbs rather than things, so the diagram's labels are instructions, and editing a label is editing what the agent will do.

## References

- Anthropic (2025). Equipping agents for the real world with Agent Skills. <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills>
- AGENTS.md (2025). A simple, open format for guiding coding agents. <https://agents.md/>
- Ao, J., Wu, F., Wu, Y., Swikir, A. & Haddadin, S. (2025). LLM-as-BT-Planner: leveraging LLMs for behavior tree generation in robot task planning. *ICRA 2025*. <https://arxiv.org/abs/2409.10444>
- BehaviorTree.CPP documentation. <https://www.behaviortree.dev/>
- BehaviorTree.CPP source repository. <https://github.com/BehaviorTree/BehaviorTree.CPP>
- BTGenBot-2: efficient behavior tree generation with small language models (2026). arXiv:2602.01870. <https://arxiv.org/abs/2602.01870>
- Cao, Y. & Lee, C. S. G. (2023). Robot behavior-tree-based task generation with large language models. arXiv:2302.12927. <https://arxiv.org/abs/2302.12927>
- Champandard, A. J. & Dunstan, P. (2013). The behavior tree starter kit. In S. Rabin (ed.), *Game AI Pro*, CRC Press. <https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter06_The_Behavior_Tree_Starter_Kit.pdf>
- Chekam, I. M., Pastor-Martinez, I., Tourani, A., Millan-Romera, J. A., Ribeiro, L., Bastos Soares, P. M., Voos, H. & Sanchez-Lopez, J. L. (2025). Interpretable robot control via structured behavior trees and large language models. arXiv:2508.09621. <https://arxiv.org/abs/2508.09621>
- Claude Code documentation. Manage Claude's memory. <https://docs.claude.com/en/docs/claude-code/memory>
- Colledanchise, M. & Ögren, P. (2017). How behavior trees modularize hybrid control systems and generalize sequential behavior compositions, the subsumption architecture, and decision trees. *IEEE Transactions on Robotics* 33(2), 372–389. <https://doi.org/10.1109/TRO.2016.2633567>
- Colledanchise, M. & Ögren, P. (2018). *Behavior Trees in Robotics and AI: An Introduction*. CRC Press. <https://arxiv.org/abs/1709.00084>
- Enhancing game AI behaviors with large language models and agentic AI (2025). *FSE 2025 Industry Papers*. <https://conf.researchr.org/details/fse-2025/fse-2025-industry-papers/25/Enhancing-Game-AI-Behaviors-with-Large-Language-Models-and-Agentic-AI>
- Francis, A. (2017). Overcoming pitfalls in behavior tree design. In S. Rabin (ed.), *Game AI Pro 3*, CRC Press. <https://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter09_Overcoming_Pitfalls_in_Behavior_Tree_Design.pdf>
- Ghzouli, R., Berger, T., Johnsen, E. B., Dragule, S. & Wąsowski, A. (2020). Behavior trees in action: a study of robotics applications. *SLE 2020*. <https://doi.org/10.1145/3426425.3426942>
- Harel, D. (1987). Statecharts: a visual formalism for complex systems. *Science of Computer Programming* 8(3), 231–274. <https://doi.org/10.1016/0167-6423(87)90035-9>
- Iovino, M., Scukins, E., Styrud, J., Ögren, P. & Smith, C. (2022). A survey of behavior trees in robotics and AI. *Robotics and Autonomous Systems* 154. <https://doi.org/10.1016/j.robot.2022.104096>
- Isla, D. (2005). Handling complexity in the Halo 2 AI. *Game Developers Conference 2005*, proceedings published on Gamasutra. <http://www.gamasutra.com/view/feature/130663/gdc_2005_proceeding_handling_.php>
- Izzo, R. A., Bardaro, G. & Matteucci, M. (2024). BTGenBot: behavior tree generation for robotic tasks with lightweight LLMs. arXiv:2403.12761. <https://arxiv.org/abs/2403.12761>
- Kelley, R. (2024). Behavior trees enable structured programming of language model agents. arXiv:2404.07439. <https://arxiv.org/abs/2404.07439>
- Li et al. (2024). A study on training and developing large language models for behavior tree generation. arXiv:2401.08089. <https://arxiv.org/abs/2401.08089>
- Lykov, A. & Tsetserukou, D. (2023). LLM-BRAIn: AI-driven fast generation of robot behaviour tree based on large language model. arXiv:2305.19352. <https://arxiv.org/abs/2305.19352>
- Lykov, A. et al. (2023). LLM-MARS: large language model for behavior tree generation and NLP-enhanced dialogue in multi-agent robot systems. arXiv:2312.09348. <https://arxiv.org/abs/2312.09348>
- Macenski, S., Martín, F., White, R. & Ginés Clavero, J. (2020). The Marathon 2: a navigation system. *IROS 2020*. <https://arxiv.org/abs/2003.00368>
- Mark, D. & Dill, K. (2010). Improving AI decision modeling through utility theory. *GDC 2010 AI Summit*. <https://gdcvault.com/play/1012410/Improving-AI-Decision-Modeling-Through>
- Nav2 behavior tree package documentation. <https://docs.ros.org/en/iron/p/nav2_behavior_tree>
- Ögren, P. (2012). Increasing modularity of UAV control systems using computer game behavior trees. *AIAA Guidance, Navigation, and Control Conference*. <https://www.csc.kth.se/~petter/Publications/ogren2012bt.pdf>
- Orkin, J. (2003). Applying goal-oriented action planning to games. In S. Rabin (ed.), *AI Game Programming Wisdom 2*, Charles River Media, 217–227. <https://static.hlt.bme.hu/semantics/external/pages/C%C3%A9lvez%C3%A9relt_Tev%C3%A9kenys%C3%A9gtervez%C3%A9st(GOAP)/alumni.media.mit.edu/_jorkin/WS404OrkinJ.pdf>
- Orkin, J. (2006). Three states and a plan: the A.I. of F.E.A.R. *Game Developers Conference 2006*. <https://pages.cs.wisc.edu/~dyer/cs540/handouts/gdc2006_orkin_jeff_fear.pdf>
- Agents play thousands of 3D video games (PORTAL) (2025). arXiv:2503.13356. <https://arxiv.org/abs/2503.13356>
- Schluntz, E. & Zhang, B. (2024). Building effective agents. <https://www.anthropic.com/research/building-effective-agents>
- Simpson, C. (2014). Behavior trees for AI: how they work. *Gamasutra*. <https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work>
- Unity Behavior package documentation. <https://docs.unity3d.com/6000.1/Documentation/Manual/com.unity.behavior.html>
- Unreal Engine documentation. Behavior tree in Unreal Engine: overview. <https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview>
- Unreal Engine documentation. Behavior tree node reference: composites. <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-composites>
- Unreal Engine documentation. Behavior tree node reference: decorators. <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators>
- Unreal Engine documentation. Behavior tree node reference: services. <https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-services>
- Utility system, encyclopaedia entry. <https://en.wikipedia.org/wiki/Utility_system>
- Wijekoon, A., Corsar, D. & Wiratunga, N. (2022). Behaviour trees for creating conversational explanation experiences. arXiv:2211.06402. <https://arxiv.org/abs/2211.06402>
- Wu, Y., Yue, T., Zhang, S., Wang, C. & Wu, Q. (2024). StateFlow: enhancing LLM task-solving through state-driven workflows. arXiv:2403.11322. <https://arxiv.org/abs/2403.11322>
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K. & Cao, Y. (2023). ReAct: synergizing reasoning and acting in language models. *ICLR 2023*. <https://arxiv.org/abs/2210.03629>

## Method

Web searches on 4 October 2026 across three strands: the history and vocabulary of behavior trees in game development (including game engine documentation), their formalisation and adoption in robotics, and the engineering of language-model agents together with published work combining the two. Every source listed was found in live search results with matching authors, title and venue, but the research environment could not open most publisher, preprint and engine documentation pages directly, so descriptions rest on abstracts, documentation summaries and search index extracts rather than a full reading of each text; one practitioner guide was read in full. The account of the Halo 2 system is drawn from secondary descriptions of the GDC 2005 talk, whose original slides were not consulted. No published work was found that stores a behavior tree as instructions read by the agent itself; the proposal in Part 10 is a design, not a reported result, and has not been evaluated.
