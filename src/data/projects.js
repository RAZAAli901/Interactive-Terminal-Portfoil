/**
 * Portfolio project data — the single source of truth for the projects,
 * files and browser windows. Colors are the Tokyo Night accents the design
 * assigns to each repo; they are per-project identity, not theme tokens, so
 * they stay as literal hex values.
 */

export const GITHUB_USER = 'RAZAAli901';

export const PROJECTS = [
  {
    name: 'patchsense-RAG',
    color: '#7aa2f7',
    tags: ['Python', 'LangChain', 'FAISS', 'RAG'],
    desc: 'Retrieval-Augmented Generation system for semantic patch & knowledge search over technical documentation.',
    readme:
      'A modular RAG pipeline: documents are ingested, chunked and embedded into a FAISS vector store, then served through a LangChain retrieval-QA chain. Answers are grounded in your own corpus and come back with the source passages attached, so every claim is traceable.',
  },
  {
    name: 'Sales-and-Inventory-Tracker',
    color: '#9ece6a',
    tags: ['Python', 'SQL', 'Streamlit'],
    desc: 'End-to-end sales & inventory management with live dashboards, stock alerts and reporting.',
    readme:
      'Records sales, tracks stock levels and surfaces trends through interactive Streamlit dashboards backed by a SQL store. Low-stock thresholds raise alerts automatically, and every view exports to a report small retail operations can actually act on.',
  },
  {
    name: 'AI-Pharma-Data-Extraction-Pipeline',
    color: '#bb9af7',
    tags: ['Python', 'NLP', 'OCR', 'ETL'],
    desc: 'Automated ETL pipeline extracting structured data from pharmaceutical documents.',
    readme:
      'Reads unstructured pharma paperwork — scanned PDFs included — with an OCR front end, then applies NLP models to pull out the fields that matter. Extracted values are normalized, validated and loaded as clean structured records ready for downstream analysis.',
  },
  {
    name: 'YOLOv8-Face-Recognition-System',
    color: '#e0af68',
    tags: ['PyTorch', 'YOLOv8', 'OpenCV'],
    desc: 'Real-time face detection & recognition with YOLOv8 and OpenCV.',
    readme:
      'Detects faces in a live video stream with a YOLOv8 detector and matches each crop against an enrolled gallery of embeddings. Runs at interactive frame rates on a single GPU and logs every recognition event for later review.',
  },
];

/** Canonical GitHub page for a repo, e.g. https://github.com/RAZAAli901/patchsense-RAG */
export function repoUrl(name) {
  return `https://github.com/${GITHUB_USER}/${name}`;
}

/** Git clone target for a repo — the repo URL with the .git suffix. */
export function cloneUrl(name) {
  return `${repoUrl(name)}.git`;
}
