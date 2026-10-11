/* Shared apt facts — the one place sequences read them from.
 *
 * Case B of the real desktop capture (user decision, 2026-10-10): `sudo apt install clang` on the Ubuntu 26.04.1
 * desktop package set installed online (the installer applied the security updates): 31 packages, 112 MB.
 * Raw: facts/desktop-apt-install.typescript (+ desktop-apt-update.typescript, desktop-extra.txt); facts/FACTS.md
 * § "Desktop (real)". Case A (as shipped, 17 / 28.4 MB) is in facts/desktop-asshipped/ and is not used.
 * Every value below was checked against the typescript (2026-10-10). The previous server-VM placeholders are in
 * work/_pre-integrate-engine/facts.pending.js.
 *
 * Rules for sequences (D, E, G): read every apt line, count, size, version, file name and parcel name from here;
 * never type one into a sequence.
 */
window.OT = window.OT || {};
window.OT.FACTS = window.OT.FACTS || {};
window.OT.FACTS.apt = {
  pending: false,
  source: "Ubuntu 26.04.1 desktop (minimal+minimal.en) + installer security updates, 2026-10-10",
  command: "sudo apt install clang",                 // what the terminal shows (the capture typed exactly this; Y at the prompt)
  log: "desktop-apt-install",                        // OT.LOGS key OT.term replays (D s12; the install tail in E s20)
  // OT.term.parse options that hide what the film never shows: sudo's password prompt (its stars are erased with
  // backspaces, so the committed line is "[sudo: authenticate] Password:" with no trailing space), the summary block
  // and the Y/n prompt, Get:/Fetched lines, debconf's template extraction
  drop: [/^\[sudo: authenticate\] Password:/, /^Installing:$/, /^Installing dependencies:$/, /^Suggested packages:$/, /^Recommended packages:$/,
    /^Summary:$/, /^ {2}\S/, /^Continue\? \[Y\/n\] /, /^(Get|Hit|Ign):\d+ /, /^Fetched /, /^Extracting templates from packages: /, /^debconf: /],
  dropLive: [/^\d+% \[/, /^Extracting templates from packages: /],   // download progress (names unnamed packages); template extraction
  // the parcels the viewer counts: clang + 30 friends. Only `named` ones may carry a label (STORYBOARD § c).
  parcels: 31,
  named: ["clang", "clang-21", "libclang-common-21-dev", "llvm-21-linker-tools", "libstdc++-15-dev", "libgcc-15-dev", "llvm-21-dev"],
  packets: "≈ 77,000",                               // 111,865,262 B / MSS 1448 = 77,255 full segments; never a running counter
  // E's parcel (OT.C.parcel) and the index entry that vouches for it — the same clang-21 Packages entry as before
  deb: {
    package: "clang-21",
    version: "1:21.1.8-6ubuntu1",
    file: "clang-21_21.1.8-6ubuntu1_amd64.deb",
    size: 127928,
    sizeLabel: "127,928 bytes",
    members: [["debian-binary", "4 B"], ["control.tar.zst", "1,162 B"], ["data.tar.zst", "126,574 B"]],
    filename: "pool/universe/l/llvm-toolchain-21/clang-21_21.1.8-6ubuntu1_amd64.deb",
    sha256: "792701d9c82e5f237879cc0bda552d8a127ea24b0c7d520e815aff14bd314b03",
    sha256Short: "792701d9…4b03",
  },
  // real dpkg lines (verbatim: apt's own "…" in a UTF-8 locale; archive index 14) usable as texture (E s19), in log order
  dpkg: [
    "Selecting previously unselected package clang-21.",
    "Preparing to unpack …/14-clang-21_1%3a21.1.8-6ubuntu1_amd64.deb…",
    "Unpacking clang-21 (1:21.1.8-6ubuntu1)…",
    "Setting up clang-21 (1:21.1.8-6ubuntu1)…",
    "Setting up llvm-21-dev (1:21.1.8-6ubuntu1)…",
    "Setting up clang-tools-21 (1:21.1.8-6ubuntu1)…",
    "Setting up clang (1:21.1.6-71)…",
    "Processing triggers for base-files (14ubuntu6.2)…",
    "Processing triggers for libc-bin (2.43-2ubuntu2.4)…",
    "Processing triggers for systemd (259.5-0ubuntu3.4)…",
    "Processing triggers for man-db (2.13.1-1build1)…",
    "Processing triggers for install-info (7.2-5ubuntu2)…",
  ],
  tailFrom: /^Setting up clang \(/,                  // OT.term key ref for "the install tail" (E s20)
  tailUntil: /^Processing triggers for install-info \(7\.2-5ubuntu2\)…$/,   // the log's last line (E parses `until` it)
};
