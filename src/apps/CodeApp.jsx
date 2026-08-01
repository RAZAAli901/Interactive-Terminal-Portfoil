import styles from './CodeApp.module.css';

/**
 * Code window — spec README "Window content → code".
 *
 * VS-Code look: a file-tree sidebar plus a line-numbered Python snippet. The
 * highlighting is hand-authored token data rather than a runtime highlighter —
 * one static file, one known language, no regex pass and no raw HTML.
 */

/** Token constructors: kw/fn/str/num/com/op/txt map 1:1 to the palette classes. */
const kw = (v) => ({ t: 'kw', v });
const fn = (v) => ({ t: 'fn', v });
const str = (v) => ({ t: 'str', v });
const num = (v) => ({ t: 'num', v });
const com = (v) => ({ t: 'com', v });
const op = (v) => ({ t: 'op', v });
const txt = (v) => ({ t: 'txt', v });

const FILE_TREE = [
  { name: 'data/', dir: true },
  { name: 'models/', dir: true },
  { name: 'rag_pipeline.py', nested: true, active: true },
  { name: 'llm.py', nested: true },
  { name: 'ingest.py', nested: true },
  { name: 'requirements.txt' },
  { name: 'README.md' },
];

/** rag_pipeline.py — LangChain + FAISS RetrievalQA over the patch corpus. */
const CODE_LINES = [
  [com('# rag_pipeline.py — semantic patch search over the docs corpus')],
  [kw('from'), txt(' pathlib '), kw('import'), txt(' Path')],
  [],
  [kw('from'), txt(' langchain.chains '), kw('import'), txt(' RetrievalQA')],
  [kw('from'), txt(' langchain.embeddings '), kw('import'), txt(' HuggingFaceEmbeddings')],
  [kw('from'), txt(' langchain.text_splitter '), kw('import'), txt(' RecursiveCharacterTextSplitter')],
  [kw('from'), txt(' langchain.vectorstores '), kw('import'), txt(' FAISS')],
  [kw('from'), txt(' ingest '), kw('import'), txt(' load_docs')],
  [kw('from'), txt(' llm '), kw('import'), txt(' load_llm')],
  [],
  [txt('EMBED_MODEL '), op('= '), str('"sentence-transformers/all-MiniLM-L6-v2"')],
  [txt('CHUNK_SIZE '), op('= '), num('800')],
  [],
  [],
  [kw('def'), txt(' '), fn('build_pipeline'), op('('), txt('docs, k'), op('='), num('4'), op('):')],
  [txt('    '), str('"""Index the corpus in FAISS and wire up a RetrievalQA chain."""')],
  [txt('    splitter '), op('= '), fn('RecursiveCharacterTextSplitter'), op('('), txt('chunk_size'), op('='), txt('CHUNK_SIZE, chunk_overlap'), op('='), num('120'), op(')')],
  [txt('    chunks '), op('= '), txt('splitter.'), fn('split_documents'), op('('), txt('docs'), op(')')],
  [txt('    embeddings '), op('= '), fn('HuggingFaceEmbeddings'), op('('), txt('model_name'), op('='), txt('EMBED_MODEL'), op(')')],
  [txt('    store '), op('= '), txt('FAISS.'), fn('from_documents'), op('('), txt('chunks, embeddings'), op(')')],
  [txt('    retriever '), op('= '), txt('store.'), fn('as_retriever'), op('('), txt('search_kwargs'), op('={'), str('"k"'), op(': '), txt('k'), op('})')],
  [txt('    '), kw('return'), txt(' RetrievalQA.'), fn('from_chain_type'), op('(')],
  [txt('        llm'), op('='), fn('load_llm'), op('(),')],
  [txt('        chain_type'), op('='), str('"stuff"'), op(',')],
  [txt('        retriever'), op('='), txt('retriever'), op(',')],
  [txt('        return_source_documents'), op('='), num('True'), op(',')],
  [txt('    '), op(')')],
  [],
  [],
  [kw('if'), txt(' __name__ '), op('== '), str('"__main__"'), op(':')],
  [txt('    qa '), op('= '), fn('build_pipeline'), op('('), fn('load_docs'), op('('), fn('Path'), op('('), str('"./patches"'), op(')))')],
  [txt('    answer '), op('= '), txt('qa.'), fn('invoke'), op('({'), str('"query"'), op(': '), str('"why did the tokenizer patch fail?"'), op('})')],
  [txt('    '), fn('print'), op('('), txt('answer'), op('['), str('"result"'), op('])')],
];

export default function CodeApp() {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar} aria-label="Explorer">
        <div className={styles.treeHead}>patchsense-rag</div>
        <ul className={styles.tree}>
          {FILE_TREE.map((entry) => (
            <li
              key={entry.name}
              className={[
                styles.row,
                entry.dir ? styles.dir : '',
                entry.nested ? styles.nested : '',
                entry.active ? styles.active : '',
              ].filter(Boolean).join(' ')}
              aria-current={entry.active ? 'true' : undefined}
            >
              {entry.dir ? <span className={styles.caret} aria-hidden="true">{'▸'}</span> : null}
              {entry.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Scrollable region, so it is keyboard focusable and named. */}
      <div className={styles.pane} tabIndex={0} role="group" aria-label="rag_pipeline.py source">
        <div className={styles.gutter} aria-hidden="true">
          {CODE_LINES.map((_, i) => (
            <span key={i} className={styles.lineNo}>{i + 1}</span>
          ))}
        </div>
        <code className={styles.code}>
          {CODE_LINES.map((line, i) => (
            <span key={i} className={styles.line}>
              {line.map((token, j) => (
                <span key={j} className={styles[token.t]}>{token.v}</span>
              ))}
            </span>
          ))}
        </code>
      </div>
    </div>
  );
}
