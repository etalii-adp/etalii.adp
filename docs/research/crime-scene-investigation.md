# Seeing past the scene

A crime scene investigation turns a place, a body of traces and a stream of statements into an account that can be tested in court. This analysis reviews how scene investigation and the major investigation around it are organised, which visual tools investigators, forensic scientists and analysts use along the way, which information and elements matter, and why teams struggle to distil insight from what they collect. It then reads that practice for the diagrams, designers and editors it calls for.

## Contents

1. From scene to court
2. What is recorded at a scene
3. Visual tools at the scene
4. Visual tools in the incident room
5. Reasoning about hypotheses
6. Showing the scene to a court
7. Why seeing past the scene is hard
8. The practice in seven propositions
9. Tools the practice calls for

_Part 1_

## From scene to court

Scene investigation is one stage in a longer chain. Its outputs are only as good as the procedures that keep them traceable from the first officer on the scene to the evidence presented at trial.

- **A defined process.** The European best practice manual for scene of crime examination describes the forensic process from the arrival of the first officer to the written scene report: initial actions, a scene examination strategy, the examination itself, interpretation of the findings with requests for further examination, and reporting. The manual frames each step in terms of quality principles, training and equipment rather than leaving them to individual judgement.

  [ENFSI Best Practice Manual for Scene of Crime Examination](https://www.crime-scene-investigator.net/best-practice-manual-for-scene-of-crime-examination.html)

- **Distinct roles.** In major cases the work is split. Crime scene investigators examine and recover; a crime scene manager leads them at a complex scene and advises the senior investigating officer on a forensic strategy; a crime scene co-ordinator aligns the strategies of several scenes with the investigation as a whole. Each scene therefore carries its own plan, and the plans have to be reconciled.

  [College of Policing, Crime Scene Manager](https://profdev.college.police.uk/?p=1927) · [College of Policing, Crime Scene Co-ordinator](https://profdev.college.police.uk/?p=1923) · [UK National Occupational Standard SFJCN101](https://ukstandards.org.uk/en/nos-finder/SFJCN101/develop-and-implement-forensic-strategies-for-serious-and-complex-investigations)

- **Chain of custody.** From the moment an item is recovered, every transfer, analysis and disposition is recorded with a signature, date and time. An unexplained gap can lead a court to exclude the item or give it little weight, so the custody record is as much a part of the evidence as the item itself.

  [Massachusetts State Police, chain of custody report](https://www.mass.gov/doc/fsob-chain-of-custody-report/download) · [Keiser University 2024](https://www.keiseruniversity.edu/articles/why-chain-of-custody-makes-or-breaks-a-case/)

- **The incident room.** Around the scenes sits a major incident room that gathers statements, messages, actions and their results. The UK's standardised administrative procedures and the national major-enquiry system were introduced after the Yorkshire Ripper inquiry, so that the senior investigating officer can see at any moment what is known, what has been asked and what remains outstanding.

  [College of Policing, MIRSAP](https://www.app.college.police.uk/app/major-investigation-and-public-protection/major-incident-room-standardised-administrative-procedures-mirsap) · [HOLMES 2](https://en.wikipedia.org/wiki/HOLMES_2)

> **ADP angle.** The process is a sequence of hand-overs between roles, each with its own records. A tool that holds a scene, its strategy and its custody trail as one model, rather than as separate forms, would let every later step see where an element came from.

_Part 2_

## What is recorded at a scene

The elements a scene investigation records fall into a small number of kinds, and the relations between them carry as much meaning as the elements themselves.

- **Places and geometry.** Scenes, sub-scenes, rooms, entry and exit points, cordons and common approach paths, with the positions of every item measured against fixed reference points. Geometry is what later allows trajectories, lines of sight and distances to be checked.

  [Kentucky Law Enforcement 2019, Mapping the scene](https://www.klemagazine.com/blog/2019/11/18/mapping-the-scene)

- **Traces and items.** Biological traces, fingermarks, footwear and tool marks, fibres, weapons, documents and devices, each recovered as an exhibit with a reference, a location, a time of recovery and a custody trail. Bloodstain patterns are recorded as patterns, not only as samples, because their shape and distribution encode events.

  [White paper on point clouds and bloodstain pattern analysis, 2020](https://dr.leica-geosystems.com/-/media/files/leicageosystems/products/white-papers/leica%20map360%20bloodstain%20pattern%20analysis%20whp%20915168%200120%20en%20lr.ashx)

- **People and statements.** Victims, witnesses, suspects and first responders, with what each said, when and to whom. In the incident room these become nominals, statements and actions that cross-reference one another.

  [College of Policing, MIRSAP](https://www.app.college.police.uk/app/major-investigation-and-public-protection/major-incident-room-standardised-administrative-procedures-mirsap)

- **Time.** The order of events at the scene, the times of calls, sightings and device activity, and the times at which the investigation itself acted. Digital devices add dense, machine-generated time series that must be merged with sparse human accounts.

  [SoK: timeline based event reconstruction for digital forensics, 2025](https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/124207)

- **Levels of a question.** Forensic interpretation separates what a trace is evidence of. A finding can bear on its sub-source (whose DNA this is), its source (which body fluid it came from), the activity that deposited it, or the offence. Moving from source to activity requires knowledge of transfer, persistence and background levels, and the offence level is normally left to the court.

  [Gill et al. 2022, A logical framework for forensic DNA interpretation](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9223060/) · [NIST, assigning propositions for likelihood ratios](https://www.nist.gov/document/assigningpropositionsforlikelihoodratiospdf)

> **ADP angle.** The vocabulary is small and stable: places, exhibits, people, statements, events and propositions, related by located at, recovered from, says, precedes and supports. That is the shape of a diagram type a tool engineer can specify, with the level of each proposition as an attribute rather than an afterthought.

_Part 3_

## Visual tools at the scene

Scene documentation has moved from photographs and hand-measured sketches to dense three-dimensional capture, but the purpose is unchanged: freeze the scene so that questions not yet asked can be answered later.

- **Photographs and sketches.** Overview, mid-range and close-up photographs remain the base record, combined with a measured sketch that places every exhibit. The sketch is the first diagram of a case: a floor plan with numbered items, a legend and measurements.

  [Kentucky Law Enforcement 2019, Mapping the scene](https://www.klemagazine.com/blog/2019/11/18/mapping-the-scene)

- **Total stations and photogrammetry.** Surveying instruments record coordinates, angles and elevations far faster and more accurately than tape measures, which is why they became common at traffic collisions. Photogrammetry derives three-dimensional measurements from ordinary photographs, and drone imagery extends it to whole outdoor scenes in a single flight.

  [Police Magazine, The next dimension](https://www.policemag.com/339258/the-next-dimension) · [Boston University, photogrammetry in surface scene documentation](https://open.bu.edu/items/69558bec-4573-4316-bae1-de468db2136e)

- **Terrestrial laser scanning.** Scanners capture the scene as a point cloud, a digital twin from which plan drawings, measurements and virtual walk-throughs are derived afterwards. Investigators value being able to release the scene sooner, to find details missed on site, and to answer later questions without returning.

  [NIJ grant report 302552](https://ojp.gov/pdffiles1/nij/grants/302552.pdf) · [GIM International, How 3D scanning rebuilds crime scenes for courtrooms](https://www.gim-international.com/content/article/how-3d-scanning-rebuilds-crime-scenes-for-courtrooms)

- **Bloodstain pattern software.** Impact patterns are analysed by fitting the flight paths of individual stains back to an area of origin. Stringing with physical threads has largely given way to software that calculates the area of origin from photographs or point clouds and shows it in top, side and front views or in the three-dimensional scene. Such programs are now well accepted in the bloodstain community and have been validated against patterns with known origins.

  [Area-of-origin software, encyclopaedia entry](https://en.wikipedia.org/wiki/HemoSpat) · [HemoVision validation data, 2021](https://data.mendeley.com/datasets/wszx33t77m/2) · [Deakin University, digital stringing on buried fabrics](https://dro.deakin.edu.au/articles/journal_contribution/Application_of_a_digital_stringing_protocol_on_buried_fabrics/20770825)

- **Augmented reality at the scene.** Research prototypes overlay annotations on a live view of the scene through head-mounted or handheld displays, and let a remote expert see and mark what a local investigator sees. Trials with Dutch police forensic investigators tested local and remote collaboration, and later work frames augmented reality as a way to build consensus within the team.

  [University of Essex, augmented reality for crime scene investigation](https://repository.essex.ac.uk/36914/1/Manuscript.pdf) · [Crime scene interpretation through an augmented reality environment, 2011](https://diglib.eg.org/items/0108645a-e41a-4adb-a36e-20c8dd0f9427)

> **ADP angle.** Scene capture tools are excellent at geometry and silent about meaning. A point cloud knows where a stain is, not which hypothesis it supports. The gap is a layer of typed elements and relations placed on top of the captured geometry, which is where a specialised diagram adds what a scanner cannot.

_Part 4_

## Visual tools in the incident room

Once the scene is recorded, the work moves to analysts and investigators who must connect people, places, objects and events across thousands of documents.

- **Link charts.** Link-analysis notebooks let analysts enter entities from statements and records and draw the relations between them: association charts, networks, commodity flows and activity charts. They have been standard in intelligence-led policing for three decades, and training still centres on charting technique.

  [OSCE, link analysis training for Moldovan law enforcement](https://www.osce.org/secretariat/592688) · [College of Policing, analysis references](https://www.app.college.police.uk/app-content/intelligence-management/analysis/references)

- **Timelines and sequence charts.** Events from statements, call records and devices are placed on a timeline, often one lane per person, to show who was where and when, and where accounts conflict. In digital forensics, super-timeline tools merge hundreds of artefact types into a single normalised chronology, which analysts then filter, frequently in a spreadsheet.

  [SANS, super timeline creation](https://sans.org/blog/digital-forensic-sifting-super-timeline-creation-using-log2timeline) · [Forensics Wiki, timeline analysis](https://forensics.wiki/timeline_analysis) · [SoK: timeline based event reconstruction, 2025](https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/124207)

- **Maps and geographic profiles.** Crime mapping places events on a map; geographic profiling goes further for linked series, turning the locations of offences into a probability surface over the offender's likely base. The output is a search priority, not an answer, and it is combined with other geographic information to rank suspects and areas.

  [Rossmo, geographic profiling, NCJRS](https://ojp.gov/ncjrs/virtual-library/abstracts/geographic-profiling) · [ICIAF, geographic profiling](https://iciaf.org/geographic-profiling/)

- **The action and document trail.** The major incident room itself is a visual system: indexes of nominals, vehicles and locations, a register of actions raised and closed, and a view of outstanding work. Its purpose is to make sure that related pieces of information are connected and that no line of enquiry is silently dropped.

  [Metropolitan Police, HOLMES policy statement](https://www.met.police.uk/SysSiteAssets/foi-media/metropolitan-police/policies/holmes-policy-statement.pdf) · [College of Policing, MIRSAP](https://www.app.college.police.uk/app/major-investigation-and-public-protection/major-incident-room-standardised-administrative-procedures-mirsap)

> **ADP angle.** Link charts, timelines and maps are three projections of one set of facts, yet they usually live in separate tools and are kept in step by hand. Views that share one model, so that selecting a person on the chart highlights their lane on the timeline and their places on the map, address the incident room's central task: connecting what is already known.

_Part 5_

## Reasoning about hypotheses

Recording and connecting facts is not the same as explaining them. A growing body of work offers explicit, often graphical, structures for reasoning about competing explanations.

- **Scenario reconstruction.** Dutch policing teaches investigators to reconstruct the offence as scenarios answering the classic questions of who, what, where, with what, why, how and when, and to keep several scenarios alive. A 2026 experiment with 293 German police officers found that focusing on reconstructing what happened from the evidence, rather than on the suspect, led to more evidence-based next steps, and that a falsification instruction led to more falsifying steps, although neither changed guilt ratings.

  [What happened and what proves you wrong?, 2026](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12820782/) · [Politieacademie, reconstruct the narrative](https://politieacademie.nl/en/about-us/news/reconstruct-the-narrative-and-recognise-your-cognitive-pitfalls-faster) · [Benefits of scenario reconstruction in cold case investigations](https://www.emeraldinsight.com/insight/content/doi/10.1108/JCP-09-2019-0035/full/html)

- **Analysis of competing hypotheses.** Borrowed from intelligence analysis, the method lays hypotheses out as columns and items of evidence as rows, and asks for each cell whether the item is consistent or inconsistent with the hypothesis. The emphasis falls on disconfirming evidence. It has been proposed for crime analysis as an auditable, transparent method, and applied to a homicide first misclassified as a natural death and to lead prioritisation in no-body homicide reviews.

  [Townsley, Mann & Garrett 2011](https://research-repository.griffith.edu.au/items/1c672fc1-b112-5f58-8d57-946e6ad1e78f) · [Keatley 2025](https://researchportal.murdoch.edu.au/esploro/outputs/journalArticle/Prioritizing-patterns-in-evidence-Applying-the/991005794763707891) · [Mapping the hypothetical, 2026](https://www.citedrive.com/en/discovery/mapping-the-hypothetical-a-combined-approach-to-lead-prioritisation-in-cold-case-reviews-of-no-body-homicides/)

- **Wigmore charts and argument diagrams.** Wigmore's evidence charts use a symbol syntax for propositions, evidence and inferential links, and remain the classic way to chart how items of evidence bear on the facts in issue. Wigmore charts and Bayesian networks are often presented as alternatives, but they answer different questions: the first shows the structure of an argument, the second the strength of belief.

  [Dawid et al. 2024](https://arxiv.org/abs/2403.16628)

- **Bayesian networks.** A Bayesian network draws hypotheses and items of evidence as nodes and their dependencies as arrows, and computes how belief in each should change when new evidence arrives. Forensic scientists use such networks to reason about activity-level propositions, where transfer and persistence matter. A comparison on a single well-known case applied Wigmore charts, Bayesian networks and chain event graphs to the same evidence to show what each makes visible.

  [Fenton, Neil & Lagnado 2013](https://eld.bl.uk/catalog/100024502976_0x000001) · [Taroni et al. 2014](https://discover.knoxcountylibrary.org/oreilly/ocn883246797) · [Dawid et al. 2024](https://arxiv.org/abs/2403.16628)

- **Likelihood ratios in reporting.** European guidance asks forensic scientists to report findings as the probability of the findings under each of a pair of propositions, not as the probability that a proposition is true. The pair, and its level in the hierarchy, must therefore be stated explicitly.

  [Netherlands Forensic Institute 2015, European guideline for evaluative reporting](https://www.forensicinstitute.nl/news/news/2015/05/19/european-guideline-for-evaluative-reporting-in-forensic-science)

> **ADP angle.** Each method is a structure with a fixed grammar: a matrix of hypotheses by evidence, a tree of inferences, a network of dependencies, a branching set of scenarios. All of them refer to the same exhibits and statements. They are natural diagram and designer types, and their value multiplies when they cite the scene and incident-room records instead of copying them.

_Part 6_

## Showing the scene to a court

The final audience is a judge or jury who never saw the scene. Visual reconstruction helps them understand it and also introduces new risks.

- **Three-dimensional presentation.** Point clouds and models support virtual tours, plan drawings, printed models and fully immersive views, so that a court need not visit the scene and can see evidence in its spatial context rather than in isolated photographs.

  [GIM International, How 3D scanning rebuilds crime scenes for courtrooms](https://www.gim-international.com/content/article/how-3d-scanning-rebuilds-crime-scenes-for-courtrooms) · [NIJ grant report 302552](https://ojp.gov/pdffiles1/nij/grants/302552.pdf)

- **Immersion and point of view.** Researchers have tested virtual-reality crime scenes for jurors. Critics point out that whether a juror sees an event from the viewpoint of the victim, the accused or a bystander changes how it is perceived, and that immersive reconstructions can carry emotional weight and the assumptions of whoever built them.

  [Popular Science, jurors and forensic holodecks](https://www.popsci.com/jurors-may-one-day-visit-crime-scenes-using-forensic-holodecks/) · [The Conversation 2016](https://theconversation.com/virtual-reality-robots-could-help-teleport-juries-to-crime-scenes-64382) · [Slaw 2017, Virtual reality in the courtroom](https://www.slaw.ca/2017/07/26/virtual-reality-in-the-courtroom/)

- **The limits of the underlying science.** The 2009 National Academy of Sciences report found that, apart from nuclear DNA analysis, no forensic method had been rigorously shown to connect evidence consistently and with high certainty to a specific source, and that many pattern disciplines lacked validation and known error rates. A persuasive visual can therefore outrun the reliability of what it shows.

  [National Research Council 2009](https://nap.nationalacademies.org/catalog/12589/strengthening-forensic-science-in-the-united-states-a-path-forward) · [Wrongful Convictions Blog summary](https://wrongfulconvictionsblog.org/wp-content/uploads/2012/03/champion-nas.pdf)

> **ADP angle.** A reconstruction shown to a court is a single scenario rendered as if it were the scene. A tool that keeps the scenario, its assumptions and its alternatives attached to the visual, and makes the viewpoint an explicit choice, turns a persuasive picture into an inspectable argument.

_Part 7_

## Why seeing past the scene is hard

The recurring difficulty is not a lack of data but turning data into a tested understanding without closing on one explanation too early. The literature names several causes.

- **Volume without connection.** The Yorkshire Ripper inquiry gathered tens of thousands of statements and hundreds of thousands of vehicle checks on card indexes. Cards were misfiled or never cross-referenced, the offender was interviewed nine times without being identified, and the official review concluded that the incident room's backlog failed to connect vital, related information. Today the volume comes from devices: in England and Wales more than twelve thousand devices have awaited examination, and most investigators say device analysis takes more than two weeks.

  [Byford report 1981](https://ia803407.us.archive.org/34/items/1981-byford-report-yorkshire-ripper-case-pgs-in-pt-3-redacted/1981%20Byford%20Report%20-%20Yorkshire%20Ripper%20Case%20-%20pgs%20in%20pt3%20REDACTED_text.pdf) · [Guernsey Press 2020](https://guernseypress.com/news/uk-news/2020/11/13/response-to-blunders-in-ripper-investigation-shaped-modern-police-inquiries) · [ITV News 2020](https://www.itv.com/news/2020-04-22/thousands-of-digital-devices-awaiting-analysis-by-police-investigators) · [Industry trends survey 2024](https://cellebrite.com/en/industry-trends-survey-2024)

- **Tunnel vision.** An analysis of fifty wrongful convictions and other investigative failures found confirmation bias, reinforced by groupthink and pressure to identify a perpetrator quickly, at the centre of most. Once a suspect is chosen, the investigation shifts from evidence-based to suspect-based: contrary evidence is minimised and ambiguous evidence read as support. In the Netherlands, the Schiedam park murder led to the Posthumus report and to institutionalised counter-argument in serious investigations.

  [Rossmo & Pollock 2019](https://digital.library.txstate.edu/handle/10877/8278) · [Rossmo 2008, Criminal Investigative Failures](https://iciaf.org/criminal-investigative-failures) · [Rechtspraak, tunnelvisie](https://www.rechtspraak.nl/themas/rechterlijke-dwalingen/tunnelvisie)

- **Counter-argument is not enough on its own.** A 2026 study compared investigators who regularly work with devil's advocacy, investigators who do not, and laypeople. Experience with devil's advocacy was not associated with more falsifying questions, stronger weight on exonerating evidence or larger revisions of guilt estimates, though experienced investigators asked fewer confirmatory questions. Evaluations of the Dutch reforms also report side effects: rigid structures, slow decisions and investigations kept too broad to avoid the wrong tunnel.

  [Nieuwkamp, Maegherman & Bogaard 2026](https://cris.maastrichtuniversity.nl/en/publications/facilitating-falsification-devils-advocacy-in-dutch-police-invest/) · [WODC evaluation](https://repository.wodc.nl/handle/20.500.12832/1265)

- **Context contaminates expert judgement.** Studies across fingerprints, DNA mixtures, bloodstain patterns, handwriting and pathology show that knowing a confession or the investigators' theory changes what experts see. Linear sequential unmasking responds by giving analysts task-relevant information as late as possible, documenting the trace before seeing the reference, and limiting what may change afterwards. Self-awareness alone does not remove the effect.

  [Kassin, Dror & Kukucka 2013](https://web.williams.edu/Psychology/Faculty/Kassin/files/1%20Kassin%20Dror%20Kukucka%20(2013)%20-%20FCB.pdf) · [JAAPL 2025](https://jaapl.org/content/53/2/172) · [Innocence Project, cognitive factors in forensic science](https://innocenceproject.org/news/cognitive-factors-in-forensic-science/)

- **Sensemaking is collective.** Investigators construct an understanding of an incident from partial information, and in major cases a whole team does so together. A 2024 review of organised-crime investigations treats evidence as the product of collective sensemaking and identifies factors that shape its quality; detectives from different organisations hunting one serial offender struggled precisely to organise their data into a shared picture.

  [Ormerod, Barrett & Taylor, investigative sense-making](https://ris.utwente.nl/ws/portalfiles/portal/211824698/Investigative_sense_making_in_criminal_contexts.pdf) · [Visser, Markus, Kop & Weggeman 2024](https://amsterdamuas.com/subsites/en/kc-techniek/publications/publications-general/sensemaking-and-evidence-in-criminal-investigations-of-organised-crime-a-literature-review.html)

- **Uncertainty is flattened.** Pattern disciplines often lack known error rates, findings are reported at one level of the hierarchy and heard at another, and a scanned scene or a chart looks equally certain in every part. What is measured, what is inferred and what is assumed are rarely distinguished in the visual record.

  [National Research Council 2009](https://nap.nationalacademies.org/catalog/12589/strengthening-forensic-science-in-the-united-states-a-path-forward) · [Gill et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9223060/)

> **ADP angle.** None of these challenges is solved by a better picture of the scene. They are addressed by structures that keep alternatives visible, separate observation from inference, record who knew what when, and let a team share one evolving model. That is a tooling problem as much as a training problem.

_Across the parts_

## The practice in seven propositions

Read together, the sources describe what a tool for investigative reasoning has to respect:

1. **Geometry is not meaning.** Capturing the scene precisely is necessary, but the meaning lies in typed relations between traces, events and propositions laid over it.
2. **One model, several projections.** Link charts, timelines, maps and the scene itself are views of the same facts and should stay in step.
3. **Alternatives are first-class.** Several scenarios or hypotheses should be held side by side, each with the evidence for and against it, until the evidence closes them.
4. **Disconfirmation is the useful question.** The structure should ask what would prove a scenario wrong, not only what supports it.
5. **Levels must be explicit.** Every finding should carry the level of proposition it addresses and whether it is observed, inferred or assumed.
6. **Exposure is part of the record.** Who saw which information, and when, matters for the weight of a judgement, so sequencing and provenance belong in the model.
7. **The picture shown to others carries its assumptions.** A reconstruction for a court, a briefing or a review should travel with its viewpoint, its scenario and its alternatives.

_From practice to tools_

## Tools the practice calls for

Most artefacts in this practice are spatial or relational structures (diagrams), structured registers and matrices (designers), or structured narratives (editors). The candidates below are named by their kind and by the elements and relations a tool engineer would specify.

| Candidate tool | Kind | Elements | Relations and attributes |
|---|---|---|---|
| Annotated scene plan | Diagram | Scenes, areas, exhibits, reference points, approach paths | Located at, recovered from; coordinates, recovery time |
| Exhibit and custody register | Designer | Exhibit, description, location, recovered by, transfers | Custody trail; analysis requested, result |
| Link chart | Diagram | People, places, vehicles, devices, organisations | Associates with, owns, called, was at; source per link |
| Multi-lane timeline | Diagram | Events, accounts, device records | Precedes, conflicts with; lane per person, certainty |
| Scenario board | Diagram | Scenarios, events, branching points | Branches, explains; evidence for and against each |
| Competing hypotheses matrix | Designer | Hypotheses by items of evidence | Consistent or inconsistent, weight, diagnosticity |
| Evidence chart | Diagram | Facts in issue, propositions, evidence | Supports, undermines; Wigmore-style inference chain |
| Proposition register | Designer | Proposition pairs, hierarchy level, findings | Likelihood ratio, assumptions, reported to |
| Exposure log | Designer | Analyst, task, information released, time | Released before or after the examination |
| Case narrative | Editor | Scenario text, citations of exhibits and statements | Each claim linked to the element it rests on |

> **ADP angle.** The table repeats the pattern seen in earlier analyses: structures come in pairs with the text that explains them, and they change over the course of a case. What is particular to investigation is that every tool cites the same small set of exhibits, people and events, so a shared model across diagrams, designers and editors matters more here than any single view.

## References

- A forensic science-based model for identifying and mitigating forensic mental health expert biases (2025). *Journal of the American Academy of Psychiatry and the Law* 53(2), 172. <https://jaapl.org/content/53/2/172>
- Benefits of scenario reconstruction in cold case investigations. *Journal of Criminal Psychology*. <https://www.emeraldinsight.com/insight/content/doi/10.1108/JCP-09-2019-0035/full/html>
- Boston University. The forensic utility of photogrammetry in surface scene documentation. <https://open.bu.edu/items/69558bec-4573-4316-bae1-de468db2136e>
- Byford, L. (1981). *The Yorkshire Ripper Case: Review of the Police Investigation of the Case*. Home Office. <https://ia803407.us.archive.org/34/items/1981-byford-report-yorkshire-ripper-case-pgs-in-pt-3-redacted/1981%20Byford%20Report%20-%20Yorkshire%20Ripper%20Case%20-%20pgs%20in%20pt3%20REDACTED_text.pdf>
- College of Policing. Analysis: references. <https://www.app.college.police.uk/app-content/intelligence-management/analysis/references>
- College of Policing. Crime Scene Co-ordinator role profile. <https://profdev.college.police.uk/?p=1923>
- College of Policing. Crime Scene Manager role profile. <https://profdev.college.police.uk/?p=1927>
- College of Policing. Major incident room standardised administrative procedures (MIRSAP). <https://www.app.college.police.uk/app/major-investigation-and-public-protection/major-incident-room-standardised-administrative-procedures-mirsap>
- Crime scene interpretation through an augmented reality environment (2011). Eurographics Italian Chapter Conference. <https://diglib.eg.org/items/0108645a-e41a-4adb-a36e-20c8dd0f9427>
- Dawid, A. P., Dotto, F., Graves, M., Kadane, J. B., Mortera, J., Robertson, G., Smith, J. Q. & Wilson, A. L. (2024). A comparison of graphical methods in the case of the murder of Meredith Kercher. arXiv:2403.16628. <https://arxiv.org/abs/2403.16628>
- Deakin University. Application of a digital stringing protocol on buried fabrics. <https://dro.deakin.edu.au/articles/journal_contribution/Application_of_a_digital_stringing_protocol_on_buried_fabrics/20770825>
- ENFSI. Best Practice Manual for Scene of Crime Examination. <https://www.crime-scene-investigator.net/best-practice-manual-for-scene-of-crime-examination.html>
- Fenton, N., Neil, M. & Lagnado, D. A. (2013). A general structure for legal arguments about evidence using Bayesian networks. *Cognitive Science* 37(1), 61–102. <https://eld.bl.uk/catalog/100024502976_0x000001>
- Forensics Wiki. Timeline analysis. <https://forensics.wiki/timeline_analysis>
- Gill, P., Hicks, T., Butler, J. M. et al. (2022). A logical framework for forensic DNA interpretation. *Genes* 13(6), 957. <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9223060/>
- GIM International. How 3D scanning rebuilds crime scenes for courtrooms. <https://www.gim-international.com/content/article/how-3d-scanning-rebuilds-crime-scenes-for-courtrooms>
- Guernsey Press (2020). Response to blunders in Ripper investigation shaped modern police inquiries. <https://guernseypress.com/news/uk-news/2020/11/13/response-to-blunders-in-ripper-investigation-shaped-modern-police-inquiries>
- HemoSpat, encyclopaedia entry on area-of-origin software. <https://en.wikipedia.org/wiki/HemoSpat>
- HemoVision validation data (2021). Mendeley Data. <https://data.mendeley.com/datasets/wszx33t77m/2>
- HOLMES 2, encyclopaedia entry. <https://en.wikipedia.org/wiki/HOLMES_2>
- ICIAF. Geographic profiling. <https://iciaf.org/geographic-profiling/>
- Industry trends survey (2024), digital forensics. <https://cellebrite.com/en/industry-trends-survey-2024>
- Innocence Project. Cognitive factors in forensic science. <https://innocenceproject.org/news/cognitive-factors-in-forensic-science/>
- ITV News (2020). Thousands of digital devices awaiting analysis by police investigators. <https://www.itv.com/news/2020-04-22/thousands-of-digital-devices-awaiting-analysis-by-police-investigators>
- Kassin, S. M., Dror, I. E. & Kukucka, J. (2013). The forensic confirmation bias: problems, perspectives, and proposed solutions. *Journal of Applied Research in Memory and Cognition* 2(1), 42–52. <https://web.williams.edu/Psychology/Faculty/Kassin/files/1%20Kassin%20Dror%20Kukucka%20(2013)%20-%20FCB.pdf>
- Keatley, D. A. (2025). Prioritizing patterns in evidence: applying the analysis of competing hypotheses framework to criminal investigations and cold cases. *Science & Justice* 65(5). <https://researchportal.murdoch.edu.au/esploro/outputs/journalArticle/Prioritizing-patterns-in-evidence-Applying-the/991005794763707891>
- Keiser University (2024). Why chain of custody makes or breaks a case. <https://www.keiseruniversity.edu/articles/why-chain-of-custody-makes-or-breaks-a-case/>
- Kentucky Law Enforcement (2019). Mapping the scene. <https://www.klemagazine.com/blog/2019/11/18/mapping-the-scene>
- Mapping the hypothetical: a combined approach to lead prioritisation in cold case reviews of no-body homicides (2026). *International Journal of Police Science & Management*. doi:10.1177/14613557261455693. <https://www.citedrive.com/en/discovery/mapping-the-hypothetical-a-combined-approach-to-lead-prioritisation-in-cold-case-reviews-of-no-body-homicides/>
- Massachusetts State Police. Forensic services chain of custody report. <https://www.mass.gov/doc/fsob-chain-of-custody-report/download>
- Metropolitan Police. HOLMES policy statement. <https://www.met.police.uk/SysSiteAssets/foi-media/metropolitan-police/policies/holmes-policy-statement.pdf>
- National Research Council (2009). *Strengthening Forensic Science in the United States: A Path Forward*. National Academies Press. <https://nap.nationalacademies.org/catalog/12589/strengthening-forensic-science-in-the-united-states-a-path-forward>
- Netherlands Forensic Institute (2015). European guideline for evaluative reporting in forensic science. <https://www.forensicinstitute.nl/news/news/2015/05/19/european-guideline-for-evaluative-reporting-in-forensic-science>
- Nieuwkamp, V., Maegherman, E. & Bogaard, G. (2026). Facilitating falsification: devil's advocacy in Dutch police investigations. *Journal of Police and Criminal Psychology*. <https://cris.maastrichtuniversity.nl/en/publications/facilitating-falsification-devils-advocacy-in-dutch-police-invest/>
- NIJ. Grant report 302552 on three-dimensional crime scene documentation. <https://ojp.gov/pdffiles1/nij/grants/302552.pdf>
- NIST. Assigning propositions for likelihood ratios. <https://www.nist.gov/document/assigningpropositionsforlikelihoodratiospdf>
- Ormerod, T. C., Barrett, E. C. & Taylor, P. J. Investigative sense-making in criminal contexts. <https://ris.utwente.nl/ws/portalfiles/portal/211824698/Investigative_sense_making_in_criminal_contexts.pdf>
- OSCE. Moldovan law enforcement officers enhance analytical capabilities through OSCE training. <https://www.osce.org/secretariat/592688>
- Police Magazine. The next dimension. <https://www.policemag.com/339258/the-next-dimension>
- Politieacademie. Reconstruct the narrative and recognise your cognitive pitfalls faster. <https://politieacademie.nl/en/about-us/news/reconstruct-the-narrative-and-recognise-your-cognitive-pitfalls-faster>
- Popular Science. Scientists want to take virtual reality to court. <https://www.popsci.com/jurors-may-one-day-visit-crime-scenes-using-forensic-holodecks/>
- Rechtspraak. Tunnelvisie. <https://www.rechtspraak.nl/themas/rechterlijke-dwalingen/tunnelvisie>
- Rossmo, D. K. & Pollock, J. M. (2019). Confirmation bias and other systemic causes of wrongful convictions: a sentinel events perspective. *Northeastern University Law Review* 11(2), 790–835. <https://digital.library.txstate.edu/handle/10877/8278>
- Rossmo, D. K. (ed.) (2008). *Criminal Investigative Failures*. CRC Press. <https://iciaf.org/criminal-investigative-failures>
- Rossmo, D. K. Geographic profiling. NCJRS abstract. <https://ojp.gov/ncjrs/virtual-library/abstracts/geographic-profiling>
- SANS. Digital forensic sifting: super timeline creation using log2timeline. <https://sans.org/blog/digital-forensic-sifting-super-timeline-creation-using-log2timeline>
- Slaw (2017). Virtual reality in the courtroom. <https://www.slaw.ca/2017/07/26/virtual-reality-in-the-courtroom/>
- SoK: timeline based event reconstruction for digital forensics: terminology, methodology, and current challenges (2025). <https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/124207>
- Taroni, F., Biedermann, A., Bozza, S., Garbolino, P. & Aitken, C. (2014). *Bayesian Networks for Probabilistic Inference and Decision Analysis in Forensic Science*, 2nd ed. Wiley. <https://discover.knoxcountylibrary.org/oreilly/ocn883246797>
- The Conversation (2016). Virtual reality robots could help teleport juries to crime scenes. <https://theconversation.com/virtual-reality-robots-could-help-teleport-juries-to-crime-scenes-64382>
- Townsley, M., Mann, M. & Garrett, K. (2011). The missing link of crime analysis: a systematic approach to testing competing hypotheses. *Policing* 5(2), 158–171. <https://research-repository.griffith.edu.au/items/1c672fc1-b112-5f58-8d57-946e6ad1e78f>
- UK National Occupational Standards. SFJCN101: develop and implement forensic strategies for serious and complex investigations. <https://ukstandards.org.uk/en/nos-finder/SFJCN101/develop-and-implement-forensic-strategies-for-serious-and-complex-investigations>
- University of Essex repository. Augmented reality for collaborative crime scene investigation, manuscript. <https://repository.essex.ac.uk/36914/1/Manuscript.pdf>
- Visser, C., Markus, A., Kop, N. & Weggeman, M. (2024). Sensemaking and evidence in criminal investigations of organised crime: a literature review. *International Journal of Police Science & Management* 26(1), 37–52. <https://amsterdamuas.com/subsites/en/kc-techniek/publications/publications-general/sensemaking-and-evidence-in-criminal-investigations-of-organised-crime-a-literature-review.html>
- What happened and what proves you wrong? Combatting confirmation bias in police investigations through evidence reconstruction and falsification (2026). <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12820782/>
- White paper on point clouds and bloodstain pattern analysis (2020). <https://dr.leica-geosystems.com/-/media/files/leicageosystems/products/white-papers/leica%20map360%20bloodstain%20pattern%20analysis%20whp%20915168%200120%20en%20lr.ashx>
- WODC. Evaluation of the programme to strengthen investigation and prosecution. <https://repository.wodc.nl/handle/20.500.12832/1265>
- Wrongful Convictions Blog. Summary of the National Academy of Sciences report. <https://wrongfulconvictionsblog.org/wp-content/uploads/2012/03/champion-nas.pdf>

## Method

Literature and practice searches on 3 October 2026 across four strands: how scene examination and major investigations are organised, the visual tools used at the scene and in the incident room, structured and graphical methods for reasoning about hypotheses and evidence, and the documented causes of investigative failure. Every source listed was found in live search results with matching authors, title and venue, but the research environment could not open most publisher pages and repositories, so the descriptions rest on abstracts, index summaries and practitioner summaries rather than on a full reading of each text. Commercial products are described by category rather than by name. Where author lists or volume details could not be confirmed, the reference gives the title and year only. The analysis covers practice in the United Kingdom, the Netherlands, the United States and European guidance; other jurisdictions organise scene work differently.
