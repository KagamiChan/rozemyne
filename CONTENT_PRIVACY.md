# Content Privacy Filter

## Purpose

This filter prevents published content, repository history, and media assets
from exposing facts that could help someone impersonate, profile, locate, or
socially engineer the author or another person.

The rule is **default deny**: do not copy a legacy post into this repository or
publish new content until it has been reviewed in full. A fact being old,
obsolete, or already available somewhere online does not make it safe.

This policy currently relies on manual review. Automated or AI-assisted scans
may identify risks, but they must not approve content on their own.

## Threat model

Assume a capable adversary can cheaply:

- Search, translate, summarize, and correlate the entire public corpus.
- Join posts with profiles, breach data, public records, and other public
  sources.
- Infer attributes that were never stated explicitly.
- Generate personalized phishing, impersonation, trust-building, or recovery
  attempts from weak signals.
- Preserve content indefinitely through archives, mirrors, model training, and
  Git history.

A public static site has no meaningful audience tiers. Information is either
published to everyone and reusable by machines, or it is not published.

## Public decision and transformations

The public decision is binary:

| Decision    | Meaning                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **Publish** | The final content passes every hard gate, inference check, corpus check, and residual-risk assessment.  |
| **Reject**  | The content fails a gate, remains too risky, or cannot be made safe without changing the original work. |

Before **Publish**, the permitted transformation is either:

- **Unchanged**: publish the reviewed original as-is.
- **Minimally redacted**: remove or replace a small localized unsafe span with
  `[redacted]` while preserving the original work.

There is no rewrite outcome. When uncertain, reject or request another manual
review.

## Review facets

Tag every relevant passage with all applicable facets. These tags are
non-exclusive; the strictest applicable rule wins.

| Facet                       | Meaning                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Expression**              | Opinions, feelings, interpretation, criticism, and personal voice.                             |
| **Knowledge**               | Technical information, reviews, analysis, creative technique, and transferable lessons.        |
| **Experience**              | Events or circumstances personally lived through by a subject.                                 |
| **Identity anchor**         | A fact that identifies, locates, narrows, or links a person, account, organization, or device. |
| **Metadata artifact**       | Dates, slugs, filenames, EXIF, paths, hostnames, logs, screenshots, and other incidental data. |
| **Exploit primitive**       | Information directly useful for access, recovery, impersonation, targeting, or verification.   |
| **Third-party information** | Information about someone other than the author.                                               |

Fictional framing, reviews, or technical examples do not suppress other
applicable facets. A fictionalized real event remains **Experience**; a venue
review may also contain an **Identity anchor**.

## Subject tags

Also tag whose information is involved:

| Subject                 | Rule                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Self**                | The author's own non-public information.                                                      |
| **Public persona**      | Facts deliberately and consistently published through the author's canonical public identity. |
| **Private third party** | A non-public person's information; receives the strongest protection.                         |
| **Public figure**       | May be discussed only through information relevant to the person's public role.               |

The author's willingness to disclose a shared experience does not override a
private third party's protection.

## Private sensitivity bands

Sensitivity bands are private review metadata, not public access levels. Apply
the highest band supported by any passage or credible inference.

| Band   | Name          | Meaning                                                                                               |
| ------ | ------------- | ----------------------------------------------------------------------------------------------------- |
| **S0** | Public        | Deliberately public facts whose repetition adds no meaningful harm.                                   |
| **S1** | Personal-safe | Expression, knowledge, or experience without meaningful identity anchors or exploit value.            |
| **S2** | Linkable      | Weak anchors, metadata, or inference potential that require corpus and public-web correlation review. |
| **S3** | Restricted    | Precise identity, location, routine, private history, or private-third-party information.             |
| **S4** | Prohibited    | Credentials, recovery facts, IDs, private contact points, secrets, or equivalent exploit primitives.  |

## Decision pipeline

Apply these steps in order. Later judgment cannot override an earlier failure.

1. **Hard gates**
   - S4 exploit primitives must not be published.
   - Direct private identifiers and non-consensual private-third-party
     identifiers must be removed or the post rejected.
   - A numeric or qualitative score cannot override a hard gate.
2. **Inference and external linkage**
   - Ask what a capable model can credibly deduce when the passage is joined
     with the public corpus and public web.
   - Treat a credibly inferable protected fact as though it were explicitly
     disclosed.
   - If the inferred fact would trigger an S4 or other hard gate when explicit,
     apply that hard gate immediately.
3. **Marginal corpus risk**
   - Review what new fact, confidence, relationship, timeline, or targeting
     capability this post adds to the accumulated public profile.
   - Aggregation is a corpus property, not a per-post multiplier.
4. **Residual-risk assessment**
   - Rate **identifiability**, **precision**, **consequence**, and
     **reversibility** as low, medium, or high.
   - Any high rating blocks publication unless a permitted minimal redaction
     reduces it.
5. **Binary decision**
   - Publish unchanged or minimally redacted, otherwise reject.

## Stylometric linkage

Preserving original voice may allow AI-assisted authorship attribution or
linkage to other accounts. This project accepts that as a known residual risk
because rewriting style would destroy authorship. Do not rewrite voice to seek
anonymity; reject a high-risk post instead.

## Source privacy requirement

Redaction is effective only while the unedited source, its assets, and its
repository history remain non-public. If an original becomes
publicly accessible, assume removed details can be recovered by matching its
date, title, topic, or wording. Re-review the migrated post under that
assumption; only a source published **unchanged** is automatically unaffected.

## Information that must not be published

Reject, redact, or generalize the following information, including historical
or obsolete versions:

1. **Authentication and recovery information**
   - Passwords, tokens, API keys, private links, recovery codes, security
     questions, memorable answers, or hints about how credentials are formed.
   - Facts commonly used for identity verification, such as exact birth
     details, account creation history, first devices, or childhood answers.

2. **Direct identifiers and private contact points**
   - Legal names not intentionally used as a public identity, personal email
     addresses, phone numbers, government or student identifiers, private
     usernames, messaging IDs, account numbers, and unique device names.
   - Old identifiers remain sensitive because they can connect accounts and
     support recovery or impersonation attempts.

3. **Precise location, travel, and routine**
   - Home, school, workplace, neighborhood, room, venue, commute route, regular
     schedule, check-in pattern, travel itinerary, or real-time absence.
   - Exact dates and times tied to personal events when they reveal a routine or
     make other facts easier to correlate.

4. **Identity correlations and inference chains**
   - Combinations such as age plus city plus employer, school plus graduation
     year, a dated route plus workplace, or a distinctive event plus family
     role.
   - Individually ordinary details must be evaluated together across the post,
     its assets, other posts, and intentionally public profiles.

5. **Social graph and non-public third parties**
   - Names, handles, photos, workplaces, schools, relationships, conversations,
     schedules, or distinctive stories that identify friends, relatives,
     partners, classmates, coworkers, or other non-public people.
   - Anonymize people and identifying organizations. Public figures may be
     discussed only through information relevant to their public role.

6. **Sensitive personal history**
   - Detailed family or relationship history, health information, finances,
     legal matters, private disputes, private messages, or material that could
     be used to build trust under false pretenses.
   - If this information is the core of the post, reject it. Do not replace the
     original with a newly authored safe essay.

7. **Hidden or incidental disclosures**
   - Image EXIF or GPS metadata, faces, badges, tickets, barcodes, license
     plates, notification previews, browser tabs, filenames, filesystem paths,
     hostnames, IP addresses, logs, screenshots, and code samples containing
     identifiers or secrets.
   - Tracking parameters, signed URLs, private document links, and URL paths
     that expose account names or internal structure.

## Limited exception for intentionally public facts

A stable fact deliberately published on a canonical public profile may remain
only when it is necessary to understand the post. Use the least specific
version that works.

"Already public" is not sufficient by itself. Do not repeat a fact merely
because it can be found elsewhere, and do not combine public facts into a more
useful profile. Prefer a public handle over a legal name, a broad profession
over an employer or team, and a region over a precise location.

## Safe transformations

- Delete a direct identifier or replace only that span with `[redacted]`.
- Replace a name with the shortest broad role needed for grammar, such as "a
  friend", only when `[redacted]` would make the sentence unclear.
- Delete an exact institution, organization, venue, route, age, or time, or
  minimally generalize only that detail.
- Remove a private quotation rather than paraphrasing it into new prose.
- Remove URL query strings and fragments unless they are demonstrably required
  and contain no identifiers.
- Strip metadata from retained images and inspect the visible pixels after
  cropping or redaction. Verify the resulting file with a metadata inspection
  tool before import.
- Remove identifying data from code, logs, terminal output, and screenshots;
  use clearly synthetic placeholders.
- Rename titles, slugs, filenames, and asset paths that encode a sensitive
  person, organization, location, date, or event.

### Minimal-redaction boundary

- Preserve the original title, argument, paragraph order, examples, tense,
  perspective, tone, vocabulary, and writing style unless the specific element
  itself discloses protected information.
- Edit only the smallest unsafe span: a token, phrase, sentence, link, caption,
  or asset. Use the literal `[redacted]` when an explicit omission is clearer
  than silent deletion.
- Across the whole post, redaction may touch at most three localized spans in
  one contiguous section and may remove or replace no more than 10% of the
  original body or 200 characters, whichever limit is smaller.
- Grammar repairs must be limited to the sentence directly affected by a
  deletion. Do not add claims, explanations, transitions, examples,
  conclusions, or modern commentary.
- Do not summarize, polish, translate, merge, expand, reinterpret, or replace
  paragraphs.
- Do not remove a prose paragraph. A standalone unsafe link, embed, media
  reference, or caption may be removed.
- If sensitive information appears throughout the post, drives its narrative,
  or requires edits in multiple sections, reject the post.
- If the edit changes what the author argued, how the author sounded, or why
  the post was written, reject it.

Do not use a transformation if the remaining clues can reconstruct the
original fact. When choosing between substantial editing and rejection, reject.

## Review procedure

Review all of the following before assigning an outcome:

1. Title, filename, URL slug, and frontmatter.
2. Full body text, quotations, code blocks, logs, and link destinations.
3. Images, attachments, captions, alt text, filenames, and embedded metadata.
4. The combined timeline and profile created by this post and other published
   material.
5. Whether a plausible stranger could use the information to impersonate a
   trusted person, answer a verification question, locate someone, or make a
   targeted message seem credible.

Before each decision, consult the published corpus and a private review ledger
so weak signals are not approved independently and combined accidentally. The
ledger must stay outside the public repository and contain no sensitive
excerpts. Record only:

- A stable local source identifier and destination slug.
- Facet and subject tags.
- The highest S0-S4 sensitivity band.
- The inference and marginal-corpus findings.
- Low/medium/high ratings for identifiability, precision, consequence, and
  reversibility.
- Transformation, decision, and review date.

Frontmatter dates are public metadata:

- `date` always records the original publication time. Migration, redaction,
  or republication must not replace it.
- `revised` records the latest edit after publication. Add or update it when
  migration changes the text.
- Migrated filenames use the original publication date as
  `YYYY-MM-DD-<safe-slug>.md`.
- If an exact original date creates unacceptable correlation risk, reject the
  post rather than falsifying its chronology.

Review and edit legacy files outside this repository. Copy only the final
reviewed version. Do not place rejected, unreviewed, or pre-redaction material
in repository paths, commits, issues, pull requests, or build artifacts.

For ambiguous or personally charged material, seek a second review that does
not receive unnecessary background details. If a second review is unavailable,
apply the conservative outcome.

## Repository and draft warning

The source repository and its Git history are publication surfaces.
`draft: true`, deleting a file later, hiding a post from navigation, or
returning 404 from the application does not remove content from Git history.
Sensitive material must not be staged or committed.

## New-content checklist

Before adding or publishing any post:

- [ ] The title, slug, frontmatter, body, links, and assets were reviewed.
- [ ] No direct identifier, private contact point, credential, or recovery fact
      is present.
- [ ] Location, routine, timeline, and identity combinations cannot reasonably
      narrow down a person.
- [ ] Non-public third parties and identifying organizations are anonymized.
- [ ] Images and technical artifacts contain no hidden or visible identifiers.
- [ ] Any intentionally public fact is necessary and minimally specific.
- [ ] The post still passes when correlated with existing public content.
- [ ] The private review ledger was checked and updated without sensitive
      excerpts.
- [ ] Every redaction is localized and preserves the original argument,
      structure, voice, and style.
- [ ] The final decision is **Publish**, either unchanged or after permitted
      minimal redaction.
