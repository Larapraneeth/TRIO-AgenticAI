import json
import hashlib
from datetime import datetime
from core.config import settings

class MemoryManager:
    def __init__(self):
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
            self.collection = client.get_or_create_collection(
                name="devos_memory",
                metadata={"hnsw:space": "cosine"}
            )
        except ImportError:
            self.collection = None

    def _make_id(self, text: str) -> str:
        return hashlib.md5(f"{text}{datetime.now().isoformat()}".encode()).hexdigest()

    def store(self, user_message: str, assistant_response: str, agent: str = "chat"):
        if not self.collection:
            return
        try:
            doc_id = self._make_id(user_message)
            self.collection.add(
                documents=[f"User: {user_message}\nAssistant: {assistant_response}"],
                metadatas=[{"agent": agent, "timestamp": datetime.now().isoformat()}],
                ids=[doc_id]
            )
        except Exception:
            pass

    def search(self, query: str, n_results: int = 3) -> list:
        if not self.collection:
            return []
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=min(n_results, self.collection.count())
            )
            docs = results.get("documents", [[]])[0]
            return docs
        except Exception:
            return []

    def get_context(self, query: str) -> str:
        memories = self.search(query, 3)
        if not memories:
            return ""
        return "\n\nRelevant past context:\n" + "\n---\n".join(memories[:3])

memory_manager = MemoryManager()
