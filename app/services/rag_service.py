
from pathlib import Path

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer


# Project paths
BASE_DIR = Path(__file__).resolve().parents[2]

INDEX_PATH = BASE_DIR / "artifacts" / "rag" / "industrial_faiss.index"
METADATA_PATH = BASE_DIR / "artifacts" / "rag" / "chunk_metadata.csv"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


# Resources will be loaded only once
_embedding_model = None
_loaded_index = None
_loaded_metadata = None


def load_rag_resources():

    global _embedding_model
    global _loaded_index
    global _loaded_metadata

    if (
        _embedding_model is not None
        and _loaded_index is not None
        and _loaded_metadata is not None
    ):
        return

    # Check artifact files
    if not INDEX_PATH.exists():
        raise FileNotFoundError(f"FAISS index not found: {INDEX_PATH}")

    if not METADATA_PATH.exists():
        raise FileNotFoundError(f"Metadata file not found: {METADATA_PATH}")

    # Load embedding model
    _embedding_model = SentenceTransformer(MODEL_NAME)

    # Load existing FAISS index
    _loaded_index = faiss.read_index(str(INDEX_PATH))

    # Load chunk metadata
    _loaded_metadata = pd.read_csv(METADATA_PATH)

    # Validate index and metadata alignment
    if _loaded_index.ntotal != len(_loaded_metadata):
        raise ValueError(
            "FAISS index and metadata record counts do not match!"
        )

    # Validate embedding dimensions
    if _loaded_index.d != _embedding_model.get_sentence_embedding_dimension():
        raise ValueError("Embedding dimensions do not match!")

    print("RAG RESOURCES LOADED SUCCESSFULLY!")
    print("Embedding model:", MODEL_NAME)
    print("Vector dimension:", _loaded_index.d)
    print("Total vectors:", _loaded_index.ntotal)
    print("Metadata records:", len(_loaded_metadata))


def search_knowledge(query: str, top_k: int = 3):

    if not query or not query.strip():
        raise ValueError("Search query cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    # Load resources if not already loaded
    load_rag_resources()

    # Generate query embedding
    query_embedding = _embedding_model.encode(
        [query],
        convert_to_numpy=True
    )

    query_embedding = np.asarray(
        query_embedding,
        dtype="float32"
    )

    # Normalize query vector for cosine similarity
    faiss.normalize_L2(query_embedding)

    # Search existing FAISS index
    scores, indices = _loaded_index.search(
        query_embedding,
        top_k
    )

    results = []

    for score, index in zip(scores[0], indices[0]):

        if index == -1:
            continue

        metadata = _loaded_metadata.iloc[index]

        results.append({
            "chunk_id": metadata["chunk_id"],
            "topic": metadata["topic"],
            "content": metadata["content"],
            "source_id": metadata["source_id"],
            "similarity_score": float(score)
        })

    return results
