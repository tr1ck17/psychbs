/*
 * content.js
 * All experience text and educational copy for the site lives here.
 * Edit freely; app.js only reads from window.CONTENT.
 *
 * Every factual or academic claim is marked with a // VERIFY comment.
 * Where a citation belongs, a [CITATION] placeholder has been inserted.
 * No quotes, statistics, or page numbers have been added.
 */

window.CONTENT = {
  meta: {
    pageTitle: "The Knowledge of Death",
    noscript: "This project needs JavaScript to run."
  },

  stages: ["DENIAL", "ANGER", "BARGAINING", "DEPRESSION", "ACCEPTANCE"],

  /* ------------------------------------------------------------------ */
  /* 1. OPENING                                                          */
  /* ------------------------------------------------------------------ */
  opening: {
    title: "THE KNOWLEDGE OF DEATH",
    subtitle: "Why Grief Doesn't Follow a Straight Line",
    lines: ["Someone you love dies.", "What happens next?"],
    lineLabel: "The five stages, in order",
    scrollCue: "Scroll"
  },

  /* ------------------------------------------------------------------ */
  /* 2. THE KÜBLER-ROSS MODEL                                            */
  /* ------------------------------------------------------------------ */
  model: {
    eyebrow: "The model",
    heading: "The Kübler-Ross Model",
    paragraphs: [
      // VERIFY: publication year and title of On Death and Dying (1969). [CITATION]
      "In 1969, the psychiatrist Elisabeth Kübler-Ross published On Death and Dying [CITATION].",
      // VERIFY: the stages were drawn from her work with people facing terminal illness, not bereaved survivors. [CITATION]
      "In it, she described five responses she observed in people who were facing their own terminal illness: denial, anger, bargaining, depression, and acceptance.",
      // VERIFY: the stages were later widely applied to bereavement. [CITATION]
      "Over the following decades, the stages were widely applied to something else: the grief of people who had lost someone.",
      // VERIFY: the stages were not intended as a universal, sequential roadmap. [CITATION]
      "They were never intended as a universal, sequential roadmap."
    ],
    closing: "So what happens when we try to use it that way?"
  },

  /* ------------------------------------------------------------------ */
  /* 3. THE SORTING EXERCISE                                             */
  /* ------------------------------------------------------------------ */
  exercise: {
    eyebrow: "The exercise",
    heading: "Sort your grief",
    intro: [
      "You will be shown experiences, one at a time.",
      "Place each one into a stage of the model."
    ],
    beginLabel: "Begin",
    sidebarTitle: "YOUR GRIEF",
    drawerHide: "Hide",
    drawerShow: "Show",
    hint: "Drag the card onto a stage, or select it and then choose a stage. Keyboard: press Enter on the card, then Enter on a stage, or press 1 to 5.",
    unplacedHeading: "Outside the model",
    continueLabel: "Continue",
    leaveLabel: "Leave it unplaced",

    messages: {
      choose: "Choose a stage.",
      recorded: "Recorded.",
      passed: "This stage has already passed.",
      noPlace: "The model has no place for this here.",
      cannotFit: "You cannot fit this experience into the model.",
      passedLabel: "passed",
      placedLabel: "placed"
    },

    // Shown between Phase B and Phase C. After this, the model moves
    // the line forward to its final stage.
    interlude: [
      "Time passes.",
      "Weeks. Then months.",
      "By now, the model says, you should be reaching acceptance."
    ],

    // PHASE A: experiences that map plausibly onto a stage, in order.
    // stage: 0 DENIAL, 1 ANGER, 2 BARGAINING, 3 DEPRESSION
    phaseA: [
      { stage: 0, text: "You wake up and, for a moment, forget that they are gone.", short: "forgetting, for a moment" },
      { stage: 0, text: "Their number is still in your phone. You can't bring yourself to delete it.", short: "their number, still saved" },
      { stage: 0, text: "At the funeral, none of it feels real.", short: "none of it feels real" },

      { stage: 1, text: "Someone tells you they're in a better place, and you want to scream.", short: "wanting to scream" },
      { stage: 1, text: "You're furious at the doctors. At them. At yourself.", short: "furious at everyone" },
      { stage: 1, text: "You slam a cupboard door much harder than you meant to.", short: "the cupboard door" },

      { stage: 2, text: "If only you had called that night. If only you had noticed sooner.", short: "if only" },
      { stage: 2, text: "You make promises to no one in particular, as if it could still change something.", short: "promises to no one" },
      { stage: 2, text: "You replay the last conversation, rewriting what you should have said.", short: "rewriting the last conversation" },

      { stage: 3, text: "You can't get out of bed. The day passes without you.", short: "the day passes without you" },
      { stage: 3, text: "Food has no taste. Nothing seems worth doing.", short: "nothing seems worth doing" },
      { stage: 3, text: "The silence in the house is unbearable.", short: "the silence in the house" }
    ],

    // PHASE B: experiences that fit no stage cleanly, or several at once.
    phaseB: [
      { text: "You're laughing with friends and realize that for several minutes you weren't thinking about them.", short: "laughing, and forgetting" },
      { text: "You feel relieved that their suffering is over, and then guilty for feeling relieved.", short: "relief, then guilt" },
      { text: "You talk to them out loud while you cook dinner.", short: "talking to them while you cook" },
      { text: "You feel numb, and you can't tell whether that means you're sad or fine.", short: "numb" },
      { text: "You wear their jacket. It helps, and it hurts.", short: "their jacket" },
      { text: "You're angry at them for leaving, and you miss them so much it aches.", short: "angry, and missing them" }
    ],

    // PHASE C: recurrence. Each card clearly belongs to a stage the model
    // has already closed. "fits" lists the stages it belongs to.
    // At least 3 of these are always shown.
    phaseC: [
      { fits: [0, 3], text: "Months later, a song they loved plays and the loss feels new again.", short: "the song" },
      { fits: [1], text: "You feel angry again.", short: "angry again" },
      { fits: [2], text: "On their birthday, you catch yourself thinking: if only I had done something differently.", short: "if only, again" },
      { fits: [0], text: "You pick up your phone to tell them something, before you remember.", short: "reaching for the phone" },
      { fits: [3], text: "A holiday comes. Their chair is empty, and you can't stop crying.", short: "the empty chair" }
    ],

    // PHASE D: collapse. Rules loosen; everything is accepted.
    // "lean" is where the card drifts if it places itself (optional).
    userPlacesInD: 3,
    phaseD: [
      { text: "A memory, out of nowhere.", label: "memory" },
      { text: "Relief.", label: "relief" },
      { text: "Love, with nowhere to go.", label: "love" },
      { text: "Guilt.", label: "guilt" },
      { text: "Longing.", label: "longing" },
      { text: "Happiness, and you let yourself feel it.", label: "happiness" },
      { text: "Sadness, again.", label: "sadness", lean: 3 },
      { text: "Anger, again.", label: "anger", lean: 1 },
      { text: "Disbelief, again.", label: "disbelief", lean: 0 },
      { text: "If only, again.", label: "if only", lean: 2 }
    ],
    // Extra repeats that flood in at the end, stacking duplicates.
    phaseDEchoes: [
      { text: "Anger.", label: "anger", lean: 1 },
      { text: "Anger.", label: "anger", lean: 1 },
      { text: "Anger.", label: "anger", lean: 1 },
      { text: "Sadness.", label: "sadness", lean: 3 },
      { text: "Sadness.", label: "sadness", lean: 3 },
      { text: "If only.", label: "if only", lean: 2 },
      { text: "It isn't real.", label: "disbelief", lean: 0 },
      { text: "Their laugh, suddenly.", label: "memory" },
      { text: "Missing them.", label: "longing" },
      { text: "Love.", label: "love" },
      { text: "Okay, for a day.", label: "okay" },
      { text: "Guilt.", label: "guilt" }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 4. END OF JOURNEY                                                   */
  /* ------------------------------------------------------------------ */
  ending: {
    // text steps appear and stay; "pause" waits; "clear" fades to black.
    sequence: [
      { text: "END OF JOURNEY", style: "heading", hold: 2400 },
      { text: "You made it through the five stages.", hold: 2600 },
      { pause: 2200 },
      { text: "Except you didn't.", hold: 3200 },
      { clear: true, pause: 2400 },
      { text: "There was never a path to complete.", hold: 2600 },
      { text: "There was never a correct order.", hold: 3000 },
      { text: "You were never supposed to finish the five stages.", style: "final", hold: 2600 }
    ],
    continueLabel: "Continue"
  },

  /* ------------------------------------------------------------------ */
  /* 5. THE PROBLEM WITH THE LINE                                        */
  /* ------------------------------------------------------------------ */
  problem: {
    eyebrow: "What just happened",
    heading: "The Problem with the Line",
    intro: [
      "The model did not fail because you sorted badly. It failed because grief does not move in one direction.",
      "Your \"failure\" was the point of the exercise. It is the discovery the exercise was built to produce."
    ],
    sections: [
      {
        heading: "Where the stages came from",
        paragraphs: [
          // VERIFY: Kübler-Ross's observations came from interviews/work with terminally ill patients. [CITATION]
          "Kübler-Ross developed the stages from her clinical work with people who were dying. She was describing how some patients responded to the news of their own terminal illness [CITATION].",
          // VERIFY: the original work was not a study of bereaved people. [CITATION]
          "It was not originally a study of people grieving someone else's death."
        ]
      },
      {
        heading: "How the line spread",
        paragraphs: [
          // VERIFY: the stages became widely known in popular culture and were applied to bereavement. [CITATION]
          "The five stages became one of the best-known ideas in psychology outside the field. They spread through popular culture and were widely applied to bereavement, often as a sequence that grieving people were expected to pass through [CITATION].",
          // VERIFY: Kübler-Ross later wrote (with David Kessler) that the stages were not meant to be linear or to package grief neatly. Do not quote without checking the source. [CITATION]
          "Kübler-Ross herself later wrote, with David Kessler, that the stages were not meant to be a neat, linear sequence [CITATION]."
        ]
      },
      {
        heading: "Not universal, not sequential",
        paragraphs: [
          // VERIFY: bereavement researchers have criticized stage models for lacking empirical support for a fixed order. [CITATION]
          "Bereavement researchers have criticized stage models for a lack of evidence that people move through fixed stages in a fixed order [CITATION].",
          // VERIFY: concern that stage models can lead people to think they are grieving "wrongly". [CITATION]
          "When a sequence is treated as the norm, people who do not follow it may come to believe they are grieving incorrectly [CITATION]."
        ]
      },
      {
        heading: "Emotions return, and overlap",
        paragraphs: [
          // VERIFY: grief responses often recur and co-occur rather than resolving in order. [CITATION]
          "A song, a date, or a smell can bring back feelings that seemed finished. Anger and love can arrive together. Relief and guilt can arrive in the same breath. The model has no box for any of that [CITATION]."
        ]
      },
      {
        heading: "Every grief is different",
        paragraphs: [
          // VERIFY: grief varies with the relationship, the circumstances of the death, culture, personality, and support. [CITATION]
          "How someone grieves varies with who they lost, how the death happened, their culture and beliefs, their personality, and the support around them [CITATION]. No single path can hold all of that."
        ]
      }
    ],
    summary: {
      heading: "Your path through the model",
      intro: "This is what you did, including what the model refused.",
      placedIn: "Placed in",
      unplaced: "No place in the model",
      tried: "Tried",
      reasons: {
        passed: "the stage had already passed",
        noPlace: "the model had no place for it"
      },
      // {n} is replaced with a number, {labels} with a list.
      flood: "Then {n} more experiences arrived, faster than they could be sorted: {labels}.",
      totalsHeading: "What each box ended up holding",
      entries: "entries",
      entry: "entry"
    }
  },

  /* ------------------------------------------------------------------ */
  /* 6. THERE IS ANOTHER WAY TO THINK ABOUT GRIEF                        */
  /* ------------------------------------------------------------------ */
  another: {
    eyebrow: "Afterward",
    heading: "There Is Another Way to Think About Grief",
    intro: [
      "Contemporary grief research offers several ways of understanding grief. None of them is a single path, and none of them is the correct way to grieve."
    ],
    constellationLabel: "The fragments of the five boxes drift apart and reconnect as a constellation with no single direction.",
    perspectives: [
      {
        title: "Continuing bonds",
        // VERIFY: associated with Klass, Silverman & Nickman (1996), Continuing Bonds. [CITATION]
        body: "Rather than \"letting go,\" many people keep an ongoing connection with the person who died: talking to them, keeping their things, carrying their values. This perspective treats that bond as a normal part of grief, not a failure to move on [CITATION]."
      },
      {
        title: "Oscillation between loss and restoration",
        // VERIFY: Dual Process Model, Stroebe & Schut (1999). Loss-orientation vs restoration-orientation, and oscillation between them. [CITATION]
        body: "The Dual Process Model describes grieving people moving back and forth between confronting the loss and attending to the changes in daily life, including taking time away from grief. The movement between them is part of coping [CITATION]."
      },
      {
        title: "Meaning reconstruction",
        // VERIFY: associated with Robert Neimeyer and colleagues. [CITATION]
        body: "Loss can disrupt the story a person tells about their life. This perspective sees grieving as, in part, the work of rebuilding or reaffirming meaning after the loss [CITATION]."
      },
      {
        title: "Resilience and many trajectories",
        // VERIFY: associated with George Bonanno and colleagues; research identifying several distinct trajectories, including resilience. Do not add statistics without the source. [CITATION]
        body: "Research following people over time has described several different patterns of adjustment after loss, and has found that many people show considerable resilience. There is more than one normal course [CITATION]."
      },
      {
        title: "Life continuing alongside the loss",
        // VERIFY: "growing around grief" is associated with Lois Tonkin. [CITATION]
        body: "Some describe grief not as shrinking over time, but as life slowly growing around it. The loss stays; the life around it becomes larger [CITATION]."
      }
    ],
    closing: [
      "Grief is not a line to be completed.",
      "It returns, overlaps, and changes shape.",
      "You were never supposed to finish the five stages."
    ],
    restartLabel: "Begin again",
    referencesHeading: "Sources to confirm",
    // VERIFY every entry. Complete each reference in the required style.
    references: [
      "Kübler-Ross, E. (1969). On Death and Dying. [CITATION: complete reference]",
      "Kübler-Ross, E., & Kessler, D. (2005). On Grief and Grieving. [CITATION: complete reference]",
      "Klass, D., Silverman, P. R., & Nickman, S. L. (Eds.). (1996). Continuing Bonds. [CITATION: complete reference]",
      "Stroebe, M., & Schut, H. (1999). The Dual Process Model of coping with bereavement. [CITATION: complete reference]",
      "Neimeyer, R. A. — meaning reconstruction. [CITATION: choose source]",
      "Bonanno, G. A. — resilience and grief trajectories. [CITATION: choose source]",
      "Tonkin, L. — growing around grief. [CITATION: choose source]",
      "Critiques of stage models of grief. [CITATION: choose source]"
    ]
  }
};
