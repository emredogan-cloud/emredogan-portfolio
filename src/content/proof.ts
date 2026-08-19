import type { ProofSection } from './schema';

/**
 * Social proof, without testimonials.
 *
 * There are no client testimonials on this site because there are no clients
 * to quote. Writing "Emre delivered exceptional work — Sarah, CTO" would have
 * been trivial and is exactly the thing this build refuses to do; an invented
 * quote is not weak evidence, it is a lie about a person who does not exist.
 *
 * What replaces it is stronger anyway: every claim below is a number a
 * stranger can reproduce, with the link to reproduce it and the method that
 * produced it. Nothing here rests on being believed.
 *
 * **Not used as proof, deliberately:** GitHub stars (every repository has
 * zero, and a vanity metric at zero is still a vanity metric), follower count
 * (24, and it measures nothing about the code), and anything resembling users,
 * revenue or downloads, none of which exist in a form anyone can verify.
 *
 * `verifiedOn` is the date each URL was checked by hand. It is published so
 * that a reader knows how stale the check is rather than having to assume.
 */
export const proof: ProofSection = {
  disclosure:
    'No testimonials. There are no clients to quote yet, and inventing one would tell you more about my judgement than any quote could. Here is what can be checked instead — every number below links to the place you can verify it.',
  verifiedOn: '2026-08-19',

  entries: [
    {
      id: 'public-repos',
      value: '40',
      label: 'public repositories',
      detail:
        'Original public repositories under one account — web, mobile, cloud tooling, games and research. Two further repositories are forks and are not counted.',
      method: 'GitHub REST API: 42 public repositories, minus the 2 marked as forks.',
      verifyUrl: 'https://github.com/emredogan-cloud?tab=repositories',
      verifyLabel: 'Open the account',
    },
    {
      id: 'live-domains',
      value: '2',
      label: 'live on the public internet',
      detail:
        'A learning platform on its own domain and a product site, both answering 200 to an ordinary request. Not a staging link, not a screenshot.',
      method: 'HTTP GET against each origin, re-checked on the date shown below.',
      verifyUrl: 'https://www.ehliyetegitim.com',
      verifyLabel: 'Open the live platform',
    },
    {
      id: 'release',
      value: '1.0.0+8',
      label: 'approved production release',
      detail:
        'PawDoc reached an approved production release build. The full source is public, including the hardcoded emergency path that runs before the model and the test that keeps it in parity across three languages.',
      method: 'Release build number from the repository, whose source is open for inspection.',
      verifyUrl: 'https://github.com/emredogan-cloud/PawDoc',
      verifyLabel: 'Read the source',
    },
    {
      id: 'commits',
      value: '1,068',
      label: 'commits, default branches',
      detail:
        'Across the six projects on this site that are under version control, between April and August 2026. Counted on the default branch, so the figure does not move when a feature branch does.',
      method:
        'git rev-list --count on each default branch. Five of the six repositories are public.',
      verifyUrl: 'https://github.com/emredogan-cloud?tab=repositories',
      verifyLabel: 'Count them yourself',
    },
    {
      id: 'this-site',
      value: 'Open',
      label: 'this site, source and all',
      detail:
        'Including the CI that gates every push on lint, types, unit and browser tests, axe with zero violations, and a bundle budget that fails the build when exceeded.',
      method: 'Public repository; the workflow file and its run history are both readable.',
      verifyUrl: 'https://github.com/emredogan-cloud/emredogan-portfolio',
      verifyLabel: 'Read this site’s source',
    },
    {
      id: 'shipping-speed',
      value: '28 days',
      label: 'first commit to live domain',
      detail:
        'Ehliyet Akademi went from an empty repository to a live production domain in under a month, with architecture decision records kept in-repo the whole way.',
      method: 'git log --reverse for the first commit, against the domain’s launch.',
      verifyUrl: 'https://github.com/emredogan-cloud/ehliyet-akademi',
      verifyLabel: 'Check the history',
    },
  ],
};
