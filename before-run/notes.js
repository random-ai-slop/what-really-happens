/* Inspect notes for "What Really Happens Before You Click Run" (hand-written; scripts/build-web.py leaves this file alone).
 *
 * Small "+" marks appear on a few real objects while the film is paused at the right moment. Each note:
 *   { title, from(OT), to(OT) — a window in film seconds from the narration's words (so it follows re-timing; a note
 *     in a dropped optional beat throws in from/to and never shows), find(doc) → the element to pin to (shown only
 *     while it is visibly on screen), anchor: 'tr' | 'tl' | 'br' | 'bl' | 'c', html }.
 * Every value comes from STORYBOARD.md § c and facts/FACTS.md (Ubuntu 26.04.1, x86-64, QEMU + EDK II, the desktop
 * capture of 2026-10-10). No password hash is shown: after $6$ only blocks. */
(function () {
  const seen = (e) => {
    if (!e || (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true }))) return false;
    const r = e.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  };
  // the visible element among `sel` that is furthest right (or left / lowest / first in DOM order)
  const pick = (doc, sel, by = "right") => {
    let best = null, bv = -Infinity;
    doc.querySelectorAll(sel).forEach((e, i) => {
      if (!seen(e)) return;
      const r = e.getBoundingClientRect();
      const v = by === "right" ? r.right : by === "left" ? -r.left : by === "first" ? -i : r.bottom;
      if (v > bv) { bv = v; best = e; }
    });
    return best;
  };
  // the visible element among `sel` whose text matches
  const byText = (doc, sel, re) => { for (const e of doc.querySelectorAll(sel)) if (re.test(e.textContent) && seen(e)) return e; return null; };

  window.XP_NOTES = [
    {
      title: "The first instruction",
      from: (OT) => OT.at("s03", "sixteen") - 0.3, to: (OT) => OT.at("s04", "Often,"),
      find: (d) => pick(d, '[data-seq="B"] .b-cell'), anchor: "tr",
      html: `<pre><span class="d">0xFFFFFFF0</span>  <span class="g">0F 20 C0</span>        mov  eax, cr0
            A8 01           test al, 1
            74 05           jz   .Real
            E9 2C FF FF FF  jmp  Main32
            E9 11 FF        jmp  EarlyBspInitReal16   <span class="d">; .Real</span>
            90              nop</pre>
<p>Out of reset, an x86 processor fetches from 0xFFFFFFF0: the last 16 bytes below 4 GiB. That address is the flash chip that holds the firmware, not RAM. These are the real 16 bytes of the EDK II firmware the capture booted (<i>ResetVectorVtf0.asm</i>).</p>
<p>The very first instruction reads control register 0 to see whether the CPU is still in real mode. Straight out of reset it is, so <b>jz</b> skips the 32-bit jump and lands on the 16-bit start-up path. Other vendors' firmware differs; the address doesn't.</p>`,
    },
    {
      title: "Signed by Microsoft",
      from: (OT) => OT.at("s05", "With") - 0.3, to: (OT) => OT.at("s06", "unpacks"),
      find: (d) => pick(d, ".ot-bootcard"), anchor: "tr",
      html: `<pre>EFI/BOOT/BOOTX64.EFI = EFI/ubuntu/shimx64.efi   <span class="d">966,768 bytes</span>
  signed by <span class="g">Microsoft Corporation UEFI CA 2011</span>
  <span class="d">certificate: Microsoft Windows UEFI Driver Publisher</span>
EFI/ubuntu/grubx64.efi                         <span class="d">2,828,168 bytes</span>
/boot/vmlinuz-7.0.0-34-generic                <span class="d">17,303,944 bytes</span>
  signed by <span class="g">Canonical Ltd. Secure Boot Signing (2022 v1)</span></pre>
<p>With Secure Boot on, the firmware only starts code signed by a key it trusts, and PCs ship trusting Microsoft's UEFI CA. So Linux begins with <i>shim</i>, a small loader that Microsoft signs. Shim then checks GRUB and the kernel, which Canonical signs.</p>
<p>Microsoft's chain goes up to <i>Microsoft Corporation Third Party Marketplace Root</i>. Canonical's goes up to <i>Canonical Ltd. Master Certificate Authority</i>. All of it sits on the ESP, a 106 MB FAT32 partition.</p>`,
    },
    {
      title: "/etc/shadow",
      from: (OT) => OT.at("s10", "hashes") - 0.2, to: (OT) => OT.end("s10", "Welcome.") + 0.4,
      find: (d) => byText(d, '[data-seq="C"] .sC-file', /shadow/), anchor: "tr",
      html: `<pre><i>name</i>:<span class="g">$6$</span><span class="blk">████████████████</span>$<span class="blk">█████████████████████…</span>:<i>…</i>
      <span class="d">│     │                 └ hash, 86 characters</span>
      <span class="d">│     └ salt, 16 characters</span>
      <span class="d">└ $6$ = SHA-512 crypt</span></pre>
<p>The password itself is never stored. The second of the entry's nine colon-separated fields holds a salted hash. At login, the system hashes what you typed with the same salt and compares the two results.</p>
<p>The Ubuntu desktop installer writes the first user's hash as <b>$6$</b> (SHA-512). A later <i>passwd</i> through PAM switches it to yescrypt, <b>$y$</b>. The blocks stand in for the characters on purpose.</p>`,
    },
    {
      title: "clang and 30 friends",
      from: (OT) => OT.at("s12", "thirty") - 0.3, to: (OT) => OT.end("s12", "exactly?") + 1.0,
      find: (d) => pick(d, '[data-seq="D"] .sD-parcel', "first"), anchor: "tr", wide: true,
      html: `<p><b>Installing: 31 · Download size: 112 MB</b> (111,865,262 bytes in the index), in apt's download order:</p>
<pre class="tbl"> 1 libitm1                 30.0 kB   17 clang-tools-21         9,514 kB
 2 libasan8               3,184 kB   18 libc6-i386             2,932 kB
 3 liblsan0               1,394 kB   19 lib32gcc-s1             91.9 kB
 4 libtsan2               2,849 kB   20 lib32stdc++6             840 kB
 5 libubsan1              1,240 kB   21 libclang-rt-21-dev     4,138 kB
 6 libhwasan0             1,731 kB   22 libncurses-dev           389 kB
 7 libquadmath0             155 kB   23 liblzma-dev              179 kB
 8 <span class="g">libgcc-15-dev</span>          2,866 kB   24 zlib1g-dev               895 kB
 9 <span class="g">libstdc++-15-dev</span>       2,920 kB   25 libxml2-dev              712 kB
10 libgc1                  92.9 kB   26 llvm-21-runtime          564 kB
11 libobjc4                48.2 kB   27 libpfm4                  427 kB
12 libobjc-15-dev           196 kB   28 llvm-21                 20.0 MB
13 <span class="g">libclang-common-21-dev</span>   770 kB   29 libffi-dev              66.5 kB
14 <span class="g">llvm-21-linker-tools</span>   1,325 kB   30 llvm-21-tools            476 kB
15 <span class="g">clang-21</span>                 128 kB   31 <span class="g">llvm-21-dev</span>             51.7 MB
16 <span class="g">clang</span>                   3,886 B</pre>
<p>The gold seven carry names in the film: clang, clang-21, the packages clang-21 depends on that the desktop lacked, and llvm-21-dev, which clang-21 recommends. That recommendation pulls in the last ten (75 MB). That's why there are 31, not 21.</p>`,
    },
    {
      title: "The answer: nine addresses",
      from: (OT) => OT.at("s13", "answers") - 0.3, to: (OT) => OT.at("s14", "layers."),
      find: (d) => byText(d, '.sD-ch, [data-seq="D"] .sD-lab, [data-seq="D"] span', /^\s*185\.125\.190\.82\s*$/), anchor: "tr",
      html: `<pre>archive.ubuntu.com.  60  IN  A   91.189.92.23
                                  91.189.91.81
                                  91.189.91.83
                                  91.189.91.82
                                  185.125.190.83
                                  91.189.92.22
                                  <span class="g">185.125.190.82</span>
                                  91.189.92.24
                                  185.125.190.81</pre>
<p>The real answer, in this order. The film follows 185.125.190.82. Your machine asks systemd's stub at 127.0.0.53, which asks 10.0.2.3. Walking down from the root (<i>dig +trace</i>): <b>.</b> has 13 servers (a. … m.root-servers.net), <b>com.</b> has 13 (a. … m.gtld-servers.net), and <b>ubuntu.com.</b> has ns1–ns3.canonical.com.</p>
<p>The 60 is the time to live: keep this answer for a minute. Asked again, the same nine came back in a different order, which spreads clients across the servers.</p>`,
    },
    {
      title: "SYN, SYN-ACK, ACK",
      from: (OT) => OT.at("s16", "handshake:") - 0.3, to: (OT) => OT.end("s16", "full.") + 0.8,
      find: (d) => byText(d, '[data-seq="D"] .sD-lab, .sD-ch', /185\.125\.190\.82/), anchor: "tr",
      html: `<pre>10.0.2.15 → 185.125.190.82:80   <span class="g">SYN</span>
10.0.2.15 ← 185.125.190.82:80   <span class="g">SYN-ACK</span>
10.0.2.15 → 185.125.190.82:80   <span class="g">ACK</span>
          → GET /ubuntu/pool/universe/l/llvm-toolchain-21/
                clang-21_21.1.8-6ubuntu1_amd64.deb</pre>
<p>Port 80, because the archive's address is plain <i>http://</i>. The GET above is one of the 31 requests. Through the router at 10.0.2.2 with a 1500-byte MTU, each full segment carries 1,448 bytes, and TCP numbers them by byte: 0, 1448, 2896, …</p>
<p>Then slow start. The server begins with a small window (the narration's ten packets) and doubles it every round trip while nothing is lost. After that, Linux's <i>cubic</i> steers the window.</p>`,
    },
    {
      title: "The seal, not the road",
      from: (OT) => OT.at("s18", "Every") - 0.3, to: (OT) => OT.end("s19", "place.") + 0.5,
      find: (d) => pick(d, '[data-seq="E"] .ot-parcel'), anchor: "tr",
      html: `<pre>clang-21_21.1.8-6ubuntu1_amd64.deb      <span class="d">127,928 bytes</span>
21 3C 61 72 63 68 3E 0A  <span class="g">!&lt;arch&gt;</span>   <span class="d">an ar archive</span>
  debian-binary         4 B   "2.0"
  control.tar.zst   1,162 B
  data.tar.zst    126,574 B   <span class="d">the files</span></pre>
<pre>Packages   Size: 127928
           SHA256: <span class="g">792701d9…4b03</span>  <span class="d">= sha256sum of the download</span>
InRelease  resolute · Hash: SHA512 · PGP SIGNATURE
key        Ubuntu Archive Automatic Signing Key (2018)
           F6EC B376 2474 EDA9 D21B 7022 8719 20D1 991B C93C</pre>
<p>The parcel travels over plain HTTP. apt checks its SHA256 against the Packages index, the index against InRelease, and InRelease's signature against a key already on disk (<i>/usr/share/keyrings/ubuntu-archive-keyring.gpg</i>). Anyone could carry the parcel; nobody can forge the seal.</p>
<p>Inside is an <i>ar</i> archive holding two compressed tarballs: the archive inside an archive that dpkg unpacks.</p>`,
    },
    {
      title: "Shift + H, as the keyboard sends it",
      from: (OT) => OT.at("s23", "positions:") - 0.3, to: (OT) => OT.at("s24", "events:") + 1.2,
      find: (d) => pick(d, '[data-seq="F"] .sF-rframe'), anchor: "tr",
      html: `<pre><span class="g">02</span> 00 <span class="g">0B</span> 00 00 00 00 00
│  │  └ key slots 1–6: usage 0x0B (11), the H key
│  └ reserved
└ modifiers: bit 1 = Left Shift (usage 0xE1)</pre>
<p>A USB boot-protocol keyboard report: 8 bytes that give positions, not letters. The computer polls the keyboard for it.</p>
<pre>hid-input.c   hid_keyboard[11] = <span class="g">35</span>   KEY_H
              Left Shift       = <span class="g">42</span>   KEY_LEFTSHIFT</pre>
<p>The kernel turns positions into evdev key codes. The compositor forwards 42 and 35 to the focused window (Wayland's <i>wl_keyboard.key</i>). Only the client's keymap (xkb) turns them into a capital H.</p>`,
    },
    {
      title: "Where the save really goes",
      from: (OT) => OT.at("s28", "write,") - 0.3, to: (OT) => OT.at("s29", "There,"),
      find: (d) => pick(d, '[data-seq="G"] .sG-sheet'), anchor: "tr",
      html: `<pre>write(…, 83)  → <span class="g">83</span>         <span class="d">returns at once</span>
page cache    a 4 KiB page in RAM, marked <span class="g">dirty</span>
writeback     flusher wakes every 5 s  <span class="d">dirty_writeback_centisecs = 500</span>
              data dirty for 30 s is due  <span class="d">dirty_expire_centisecs = 3000</span>
ext4          4096-byte blocks, a 64 MB journal
NVMe          ESP · <span class="g">ext4 /</span></pre>
<p>hello.c is 83 bytes. The kernel copies them into a page of RAM, says "done", and writes the page to the drive later, in the background. <i>Hello, world</i> is 48 65 6C 6C 6F 2C 20 77 6F 72 6C 64. The whole file is 664 bits: a few hundred flash cells.</p>
<p>The kernel you booted this morning came off the same drive: /boot/vmlinuz-7.0.0-34-generic, 17,303,944 bytes.</p>`,
    },
  ];
})();
