const askAI = require("../services/groqService");

const {
    retrieveRelevantLaws,
    extractSectionNumber,
    detectAct
} = require("../services/legalRetrievalService");


function formatRetrievedLaws(laws) {

    if (!laws || laws.length === 0) {
        return "No relevant provisions were found in the legal knowledge base.";
    }

    const MAX_CONTENT_CHARS = 4500;

    return laws.map((law, index) => {

        let content = law.content || "";

        if (content.length > MAX_CONTENT_CHARS) {
            content =
                content.substring(0, MAX_CONTENT_CHARS) +
                "\n[Legal text truncated for context-size safety.]";
        }

        return `
SOURCE ${index + 1}

Act:
${law.act_name}

Act Number:
${law.act_number || "Not available"}

Section:
${law.section_number || "Not available"}

Section Title:
${law.section_title || "Not available"}

Legal Text:
${content}

Source:
${law.source_url || law.source_name}

Effective Date:
${law.effective_date || "Not available"}
`;

    }).join("\n-----------------------------\n");
}


async function lawResearchAgent(caseDescription) {

    try {

        /*
         * STEP 1
         * Detect explicit legal references before retrieval.
         *
         * This is deterministic. For example:
         *
         *   "Section 63 of BSA"
         *
         * must resolve to:
         *
         *   The Bharatiya Sakshya Adhiniyam, 2023
         *   Section 63
         *
         * The retrieval service then performs an exact DB lookup
         * and will not substitute a similarly-worded provision
         * from another Act.
         */
        const explicitSection =
            extractSectionNumber(caseDescription);

        const explicitAct =
            detectAct(caseDescription);

        if (
            explicitSection &&
            explicitAct
        ) {
            console.log(
                "LEGAL RESEARCH: Explicit legal reference detected →",
                `${explicitAct.actName} Section ${explicitSection}`
            );
        }

        /*
         * STEP 2
         * Retrieve relevant provisions from the
         * authoritative legal corpus.
         */
        const laws =
            await retrieveRelevantLaws(
                caseDescription,
                8
            );


        console.log(
            `LEGAL RAG: Retrieved ${laws.length} provision(s)`
        );

        if (
            explicitSection &&
            explicitAct &&
            laws.length === 0
        ) {
            return (
                `The requested provision could not be found in the ` +
                `legal knowledge base: ${explicitAct.actName}, ` +
                `Section ${explicitSection}. ` +
                `No substitute provision from another Act will be used.`
            );
        }


        /*
         * STEP 3
         * Convert retrieved provisions into
         * grounded context for the LLM.
         */
        const legalContext =
            formatRetrievedLaws(laws);


        /*
         * STEP 4
         * Ask Groq to reason ONLY from the
         * retrieved legal material.
         */
        const prompt = `
You are the Legal Research AI Agent for Nyaya AI.

Your task is to identify applicable Indian laws
using the retrieved legal sources provided below.

IMPORTANT RULES:

1. Use the retrieved legal sources as the primary
   legal authority.

2. If the user explicitly names an Act abbreviation
   and section number (for example BNS, BNSS, or BSA),
   preserve that exact Act/section reference. Do NOT
   reinterpret the abbreviation as another law and do
   NOT substitute a provision from another Act.

3. If an explicit Act/section was requested and the
   retrieved material is empty, say that the requested
   provision could not be verified from the available
   legal corpus.


4. Do NOT invent Acts, sections, punishments,
   legal provisions, or citations.

5. Do NOT assume that a section applies merely
   because a keyword appears.

6. If the retrieved material is insufficient,
   explicitly say that the available evidence
   is insufficient.

7. Distinguish the legal text from your
   interpretation.

8. Mention the exact Act and section number
   when supported by the retrieved source.

9. Do not treat case-law summaries as the
   text of the statute.

CASE DESCRIPTION:

${caseDescription}


RETRIEVED LEGAL SOURCES:

${legalContext}


RETURN:

1. Applicable Indian laws
2. Relevant Acts
3. Relevant Sections
4. Maximum punishment, only if supported
   by the retrieved legal material
5. Brief reasoning based on the retrieved text

Keep the answer structured and concise.
`;


        const result =
            await askAI(prompt);


        return result;


    } catch (err) {

        console.error(
            "LAW RESEARCH AGENT ERROR:",
            err
        );

        return "Unable to research applicable laws.";

    }
}


module.exports = lawResearchAgent;