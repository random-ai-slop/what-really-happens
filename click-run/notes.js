/* Inspect notes for "What Really Happens When You Click Run" (hand-written; scripts/build-web.py leaves this file alone).
 * Inspect notes: small "+" marks that appear on a few real objects while the film is paused at the right moment.
 * Each note: { title, from(OT), to(OT) — window in film seconds (from the narration's words, so it follows re-timing),
 *   find(doc) → the element to pin to (only shown while it is visibly on screen), anchor: 'tr'|'tl'|'br'|'bl', html }.
 * The data is the film's own (STORYBOARD.md "Facts"): clang -O2, x86-64 Linux, glibc. */
(function () {
  const seen = (e) => {
    if (!e || (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true }))) return false;
    const r = e.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  };
  // the visible element among `sel` that is furthest right (or left / lowest)
  const pick = (doc, sel, by = "right") => {
    let best = null, bv = -Infinity;
    doc.querySelectorAll(sel).forEach((e) => {
      if (!seen(e)) return;
      const r = e.getBoundingClientRect();
      const v = by === "right" ? r.right : by === "left" ? -r.left : r.bottom;
      if (v > bv) { bv = v; best = e; }
    });
    return best;
  };
  const first = (doc, sels) => { for (const s of sels) { const e = pick(doc, s); if (e) return e; } return null; };

  window.XP_NOTES = [
    {
      title: "main, as machine code",
      from: (OT) => OT.at("s08", "seventeen") - 0.3, to: (OT) => OT.at("s08", "later") + 0.1,
      find: (d) => pick(d, '[data-seq="D"] .sD-chip:not(.g)'), anchor: "tr",
      html: `<pre><span class="d">off  bytes                 </span>
00   50                    push rax
01   48 8D 3D <span class="k">00 00 00 00</span>  lea  rdi, [rip + .Lstr]
08   E8 <span class="k">00 00 00 00</span>        call puts
0D   31 C0                 xor  eax, eax
0F   59                    pop  rcx
10   C3                    ret</pre>
<p>Seventeen bytes in <i>hello.o</i>. The zeros are holes the assembler can't fill yet, so it leaves notes (relocations) for the linker:</p>
<pre>0x04  R_X86_64_PC32   .Lstr - 4
0x09  R_X86_64_PLT32  puts - 4</pre>
<p><b>push rax</b> and <b>pop rcx</b> only keep the stack 16-byte aligned for the call; <b>xor eax, eax</b> is the <i>return 0</i>.</p>`,
    },
    {
      title: ".Lstr — the string",
      from: (OT) => OT.at("s08", "seventeen") - 0.3, to: (OT) => OT.at("s08", "later") + 0.1,
      find: (d) => pick(d, '[data-seq="D"] .sD-chip.g'), anchor: "br",
      html: `<pre>48 65 6C 6C 6F 2C 20 77 6F 72 6C 64 21 <span class="g">00</span>
 H  e  l  l  o  ,     w  o  r  l  d  ! <span class="g">\\0</span></pre>
<p>Fourteen bytes of <i>.rodata</i>: thirteen characters and the zero that marks the end. The <b>\\n</b> you typed is gone: the optimizer swapped <i>printf</i> for <i>puts</i>, and puts adds the newline itself.</p>`,
    },
    {
      title: "Holes, filled",
      from: (OT) => OT.at("s09", "fills") - 0.2, to: (OT) => OT.at("s09", "result"),
      find: (d) => pick(d, '[data-seq="D"] .sD-chip:not(.g)'), anchor: "tr",
      html: `<p>The linker gives everything a final address — <b>main</b> at 0x1140, the string at 0x2004, a small stub <b>puts@plt</b> at 0x1030 — then writes each hole as a distance from the next instruction (little-endian):</p>
<pre>48 8D 3D <span class="g">BC 0E 00 00</span>   0x1148 + 0x0EBC = 0x2004
E8 <span class="g">E3 FE FF FF</span>         0x114D − 0x011D = 0x1030</pre>
<p>The stub jumps through a table slot that the dynamic linker fills in at launch with the address of the real <i>puts</i> inside libc.so.6.</p>`,
    },
    {
      title: "The ELF header",
      from: (OT) => OT.at("s09", "result"), to: (OT) => OT.at("s14", "builds"),
      find: (d) => pick(d, ".ot-seq .ot-slab"), anchor: "tr",
      html: `<pre><span class="g">7F 45 4C 46</span>   magic: 0x7F 'E' 'L' 'F'
02            64-bit
01            little-endian
01            ELF version 1
00 …          System V ABI, padding
03 00         type: ET_DYN (position-independent)
3E 00         machine: x86-64
40 10 00 00…  entry point: 0x1040 (_start)</pre>
<p>The first row and a half of the file. <i>execve</i> checks the magic number before anything else; without it the kernel refuses with ENOEXEC (and your shell would try the file as a script).</p>`,
    },
    {
      title: "The map inside: program headers",
      from: (OT) => OT.at("s13", "map") - 0.3, to: (OT) => OT.at("s14", "puts") + 1,
      find: (d) => pick(d, '[data-seq="E"] .sE-ph'), anchor: "tr",
      html: `<pre>PHDR        the table itself
INTERP      /lib64/ld-linux-x86-64.so.2
LOAD   r--  ELF header, symbols
LOAD   r-x  .text      _start, main
LOAD   r--  .rodata    "Hello, world!"
LOAD   rw-  .data, .got
DYNAMIC     needs libc.so.6
GNU_STACK   rw-  (stack not executable)
entry       0x1040</pre>
<p>What <i>readelf -l hello</i> prints. Each LOAD says “map this part of the file here, with these permissions”; INTERP names the program that runs first — the dynamic linker.</p>`,
    },
    {
      title: "A fresh address space",
      from: (OT) => OT.at("s14", "builds"), to: (OT) => OT.at("s15", "fault"),
      find: (d) => pick(d, ".ot-seq .ot-mem"), anchor: "tr",
      html: `<pre>0x7ffd…          stack    rw-  argc=1, argv[0]="./hello"
0x7f3a…          libc.so.6 r-x
0x5555…9000      heap     rw-
0x555555558000   .data    rw-
0x555555556000   .rodata  r--  <span class="g">"Hello, world!"</span> @ …6004
0x555555555000   .text    r-x  _start @ …5040, main @ …5140</pre>
<p>A position-independent executable lands at 0x555555554000 when address randomisation is off (as under gdb); normally the kernel picks new bases on every run. Dashed bands are <i>promised</i>: mapped, but no page is in RAM until something touches it.</p>`,
    },
    {
      title: "The page fault",
      from: (OT) => OT.at("s15", "fault") - 0.3, to: (OT) => OT.at("s15", "there") + 1,
      find: (d) => first(d, ['[data-seq="F"] .sF-ftile']), anchor: "tr",
      html: `<p>The CPU's first fetch, at <b>_start</b> (0x555555555040), lands on a page that is mapped but not present. It raises a page fault (#PF, vector 14): the faulting address goes into <b>CR2</b>, the error code says <i>user-mode instruction fetch, page not present</i>.</p>
<p>The kernel finds the mapping, finds that 4 KB page of <i>hello</i> in its page cache (a minor fault — or reads it from disk, a major one), writes the page-table entry, and returns. The CPU re-executes the very same instruction, and this time it's there.</p>`,
    },
    {
      title: "syscall",
      from: (OT) => OT.at("s17", "sys-call") - 1.6, to: (OT) => OT.at("s17", "pixels"),
      find: (d) => first(d, ['[data-seq="F"] .sF-sysl', '[data-seq="F"] .sF-klab']), anchor: "tr",
      html: `<pre>rax = 1      write
rdi = 1      fd 1: stdout, a pseudo-terminal
rsi = buf    "Hello, world!\\n"
rdx = 14     bytes
<span class="g">0F 05</span>        syscall</pre>
<p>Two bytes switch the CPU to ring 0 and jump to the kernel's entry point. The kernel indexes its system call table with rax (1 = <i>write</i>), copies the 14 bytes to the terminal's pty, and returns 14 in rax.</p>`,
    },
  ];
})();
